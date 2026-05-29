import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { mapApplicationRowToEntity } from "@modules/applications/application/mappers/mapApplicationRow";
import {
  APPLICATION_SEARCH_FIELDS,
  APPLICATION_SORTABLE_COLUMN_MAP,
} from "@modules/applications/constants";
import { ApplicationRepositoryCreateSchema } from "@modules/applications/domain/zod/application.schema";
import {
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_STAGE_SET,
  type InteractionStage,
} from "@modules/events/constants";
import {
  buildSearchWhereClause,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveOrderByClause,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";
import {
  listTagIdsForEntity,
  syncTagIdsForEntity,
} from "@shared/utils/tagAssociations";

/**
 * Defines iapplication repository.
 */
export interface IApplicationRepository extends IRepository<
  Application,
  ApplicationCreatePayload,
  ApplicationUpdatePayload
> {
  listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Application>>;
}

/**
 * Implements application repository.
 */
export class ApplicationRepository implements IApplicationRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private readonly effectiveStageTypeExpression = `
    latest_event.type
  `;

  private readonly effectiveApplicationStatusCaseExpression = `
    CASE
      WHEN ${this.effectiveStageTypeExpression} = 'Decision/Rejected' THEN 'rejected'
      WHEN ${this.effectiveStageTypeExpression} = 'Decision/Accepted' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Offer/%' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Negotiation/%' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Post-Offer/%' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} = 'Interview/Technical Interview' THEN 'technical'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Interview/%' THEN 'interview'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Assessment/%' THEN 'interview'
      WHEN ${this.effectiveStageTypeExpression} = 'Screening/Phone Screen' THEN 'phone-screening'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Screening/%' THEN 'applied'
      WHEN ${this.effectiveStageTypeExpression} = 'Application/Saved' THEN 'saved'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Application/%' THEN 'applied'
      ELSE 'saved'
    END
  `;

  private readonly effectiveEventFlowStatusCaseExpression = `
    CASE
      WHEN ${this.effectiveStageTypeExpression} = 'Decision/Rejected' THEN 'rejected'
      WHEN ${this.effectiveStageTypeExpression} = 'Decision/Accepted' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Offer/%' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Negotiation/%' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Post-Offer/%' THEN 'offer'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Interview/%' THEN 'interview'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Assessment/%' THEN 'interview'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Screening/%' THEN 'applied'
      WHEN ${this.effectiveStageTypeExpression} = 'Application/Saved' THEN 'saved'
      WHEN ${this.effectiveStageTypeExpression} LIKE 'Application/%' THEN 'applied'
      ELSE 'applied'
    END
  `;

  private readonly latestEventJoinClause = `
    LEFT JOIN (
      SELECT
        ae.application_id,
        e.type,
        ae.event_at,
        ROW_NUMBER() OVER (
          PARTITION BY ae.application_id
          ORDER BY
            ae.event_at DESC,
            ae.created_at DESC,
            e.id DESC
        ) AS rn
      FROM application_events ae
      INNER JOIN events e ON e.id = ae.event_id
      WHERE ae.event_at IS NOT NULL
    ) latest_event
      ON latest_event.application_id = applications.id
     AND latest_event.rn = 1
  `;

  private readonly effectiveEventFlowStatusSelectClause = `
    ${this.effectiveEventFlowStatusCaseExpression} AS event_flow_status
  `;

  private readonly effectiveApplicationStatusSelectClause = `
    ${this.effectiveApplicationStatusCaseExpression} AS status
  `;

  private readonly eventStageJoinClauses = this.latestEventJoinClause;

  private readonly effectiveEventFlowStatusSearchExpression =
    this.effectiveEventFlowStatusCaseExpression;

  private readonly effectiveApplicationStatusSearchExpression =
    this.effectiveApplicationStatusCaseExpression;

  private resolveEffectiveSearchWhereClause(searchWhereClause: string): string {
    const eventFlowResolvedClause = searchWhereClause.replace(
      /\bevent_flow_status\b/g,
      this.effectiveEventFlowStatusSearchExpression,
    );

    return eventFlowResolvedClause.replace(
      /\bstatus\b/g,
      this.effectiveApplicationStatusSearchExpression,
    );
  }

  private async ensureDefaultFlowEventsLinked(
    applicationId: string,
  ): Promise<void> {
    const canonicalEventsByStage = await this.ensureCanonicalFlowEvents();
    const defaultStages = [...EVENT_FLOW_STAGE_SET];

    for (const stage of defaultStages) {
      const eventId = canonicalEventsByStage.get(stage);
      if (!eventId) {
        continue;
      }

      await this.db.execute(
        "INSERT OR IGNORE INTO application_events (application_id, event_id, event_at, created_at) VALUES ($1, $2, NULL, CURRENT_TIMESTAMP)",
        [applicationId, eventId],
      );
    }
  }

  private async ensureCanonicalFlowEvents(): Promise<
    Map<InteractionStage, string>
  > {
    const eventMap = new Map<InteractionStage, string>();

    for (const stage of EVENT_FLOW_STAGE_SET) {
      await this.db.execute(
        "INSERT OR IGNORE INTO events (id, type, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [
          crypto.randomUUID(),
          stage,
          EVENT_COPY_BY_STAGE[stage].title,
          EVENT_COPY_BY_STAGE[stage].description,
        ],
      );

      const rows = await this.db.select<{ id: string }>(
        "SELECT id FROM events WHERE type = $1 ORDER BY id ASC LIMIT 1",
        [stage],
      );

      const eventId = rows[0]?.id;
      if (eventId) {
        eventMap.set(stage, eventId);
      }
    }

    return eventMap;
  }

  private async withTags(application: Application): Promise<Application> {
    return {
      ...application,
      tagIds: await listTagIdsForEntity(this.db, "application", application.id),
    };
  }

  async list(): Promise<Application[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         applications.*,
         ${this.effectiveApplicationStatusSelectClause},
         ${this.effectiveEventFlowStatusSelectClause}
       FROM applications
       ${this.eventStageJoinClauses}
       WHERE applications.deleted_at IS NULL
       ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}`,
    );

    return Promise.all(
      rows.map(async (row) => this.withTags(mapApplicationRowToEntity(row))),
    );
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Application>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      APPLICATION_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);
    const effectiveSearchWhereClause =
      this.resolveEffectiveSearchWhereClause(searchWhereClause);

    const orderByClause = resolveOrderByClause({
      sortField: query.sortField,
      sortOrder: query.sortOrder,
      sortableColumns: APPLICATION_SORTABLE_COLUMN_MAP,
      fallbackClause: DEFAULT_CREATED_AT_ORDER_BY,
    });

    const effectiveOrderByClause =
      query.sortField === "eventFlowStatus"
        ? `${this.effectiveEventFlowStatusSearchExpression} ${query.sortOrder === "asc" ? "ASC" : "DESC"}, applications.created_at DESC`
        : query.sortField === "status"
          ? `${this.effectiveApplicationStatusSearchExpression} ${query.sortOrder === "asc" ? "ASC" : "DESC"}, applications.created_at DESC`
          : orderByClause;

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM applications
           ${this.eventStageJoinClauses}
           WHERE applications.deleted_at IS NULL
             AND (${effectiveSearchWhereClause})`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM applications
           WHERE deleted_at IS NULL`,
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT
             applications.*,
             ${this.effectiveApplicationStatusSelectClause},
             ${this.effectiveEventFlowStatusSelectClause}
           FROM applications
           ${this.eventStageJoinClauses}
           WHERE applications.deleted_at IS NULL
             AND (${effectiveSearchWhereClause})
           ORDER BY ${effectiveOrderByClause}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT
             applications.*,
             ${this.effectiveApplicationStatusSelectClause},
             ${this.effectiveEventFlowStatusSelectClause}
           FROM applications
           ${this.eventStageJoinClauses}
           WHERE applications.deleted_at IS NULL
           ORDER BY ${effectiveOrderByClause}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: await Promise.all(
        listRows.map(async (row) =>
          this.withTags(mapApplicationRowToEntity(row)),
        ),
      ),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: ApplicationCreatePayload): Promise<string> {
    const parseResult = ApplicationRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new Error("Application title is required");
    }

    const title = parseResult.data.title.trim();
    if (!title) {
      throw new Error("Application title is required");
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      `
      INSERT INTO applications (
        id,
        company_id,
        title,
        source_url,
        applied_at,
        location_text,
        location_lat,
        location_lng,
        attendance_type,
        employment_type,
        salary_min,
        salary_max,
        currency,
        description,
        interview_process,
        benefits,
        priority,
        is_archived,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      `,
      [
        id,
        parseResult.data.companyId ?? null,
        title,
        payload.sourceUrl ?? null,
        payload.appliedAt ?? null,
        parseResult.data.locationText ?? null,
        parseResult.data.locationLat ?? null,
        parseResult.data.locationLng ?? null,
        payload.attendanceType ? String(payload.attendanceType) : null,
        payload.employmentType ? String(payload.employmentType) : null,
        payload.salaryMin ?? null,
        payload.salaryMax ?? null,
        payload.currency ?? null,
        payload.description ?? null,
        payload.interviewProcess ?? null,
        payload.benefits ?? null,
        payload.priority ?? 3,
        payload.isArchived ? 1 : 0,
      ],
    );

    await syncTagIdsForEntity(this.db, "application", id, payload.tagIds);
    await this.ensureDefaultFlowEventsLinked(id);

    return id;
  }

  async update(payload: ApplicationUpdatePayload): Promise<void> {
    await this.db.execute(
      `
      UPDATE applications
      SET
        company_id = $1,
        title = $2,
        source_url = $3,
        applied_at = $4,
        location_text = $5,
        location_lat = $6,
        location_lng = $7,
        attendance_type = $8,
        employment_type = $9,
        salary_min = $10,
        salary_max = $11,
        currency = $12,
        description = $13,
        interview_process = $14,
        benefits = $15,
        priority = $16,
        is_archived = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      `,
      [
        payload.companyId ?? null,
        payload.title,
        payload.sourceUrl ?? null,
        payload.appliedAt ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
        payload.attendanceType ? String(payload.attendanceType) : null,
        payload.employmentType ? String(payload.employmentType) : null,
        payload.salaryMin ?? null,
        payload.salaryMax ?? null,
        payload.currency ?? null,
        payload.description ?? null,
        payload.interviewProcess ?? null,
        payload.benefits ?? null,
        payload.priority,
        payload.isArchived ? 1 : 0,
        payload.id,
      ],
    );

    await syncTagIdsForEntity(
      this.db,
      "application",
      payload.id,
      payload.tagIds,
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(
      "UPDATE applications SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );
  }
}
