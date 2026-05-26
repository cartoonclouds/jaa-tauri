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
} from "@modules/applications/constants/applicationDatatableFields";
import { ApplicationRepositoryCreateSchema } from "@modules/applications/domain/zod/application.schema";
import {
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/types/enums";
import {
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_BY_APPLICATION_STATUS,
} from "@modules/events/presentation/constants/interactionStages";
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

  private readonly effectiveEventFlowStatusCaseExpression = `
    CASE
      WHEN latest_event.type = 'Decision/Rejected' THEN 'rejected'
      WHEN latest_event.type = 'Decision/Accepted' THEN 'offer'
      WHEN latest_event.type LIKE 'Offer/%' THEN 'offer'
      WHEN latest_event.type LIKE 'Negotiation/%' THEN 'offer'
      WHEN latest_event.type LIKE 'Post-Offer/%' THEN 'offer'
      WHEN latest_event.type LIKE 'Interview/%' THEN 'interview'
      WHEN latest_event.type LIKE 'Assessment/%' THEN 'interview'
      WHEN latest_event.type LIKE 'Screening/%' THEN 'applied'
      WHEN latest_event.type = 'Application/Saved' THEN 'saved'
      WHEN latest_event.type LIKE 'Application/%' THEN 'applied'
      ELSE applications.event_flow_status
    END
  `;

  private readonly latestEventJoinClause = `
    LEFT JOIN (
      SELECT
        ae.application_id,
        e.type,
        ROW_NUMBER() OVER (
          PARTITION BY ae.application_id
          ORDER BY
            COALESCE(e.event_at, e.created_at) DESC,
            e.created_at DESC,
            e.id DESC
        ) AS rn
      FROM application_events ae
      INNER JOIN events e ON e.id = ae.event_id
    ) latest_event
      ON latest_event.application_id = applications.id
     AND latest_event.rn = 1
  `;

  private readonly effectiveEventFlowStatusSelectClause = `
    ${this.effectiveEventFlowStatusCaseExpression} AS event_flow_status
  `;

  private readonly effectiveEventFlowStatusSearchExpression =
    this.effectiveEventFlowStatusCaseExpression;

  private resolveEffectiveSearchWhereClause(searchWhereClause: string): string {
    return searchWhereClause.replace(
      /\bevent_flow_status\b/g,
      this.effectiveEventFlowStatusSearchExpression,
    );
  }

  private async ensureFlowEventsLinked(
    applicationId: string,
    eventFlowStatusValue: string,
  ): Promise<void> {
    if (
      !eventFlowStatusValue ||
      !(eventFlowStatusValue in EVENT_FLOW_BY_APPLICATION_STATUS)
    ) {
      return;
    }

    const normalizedStatus =
      eventFlowStatusValue as keyof typeof EVENT_FLOW_BY_APPLICATION_STATUS;
    const requiredStages = EVENT_FLOW_BY_APPLICATION_STATUS[normalizedStatus];
    if (requiredStages.length === 0) {
      return;
    }

    const existingRows = await this.db.select<{ type: string }>(
      `SELECT e.type
       FROM events e
       INNER JOIN application_events ae ON ae.event_id = e.id
       WHERE ae.application_id = $1`,
      [applicationId],
    );

    const existingStageSet = new Set(existingRows.map((row) => row.type));

    for (const stage of requiredStages) {
      if (existingStageSet.has(stage)) {
        continue;
      }

      const eventId = crypto.randomUUID();
      await this.db.execute(
        "INSERT INTO events (id, contact_id, type, title, description, event_at, created_at, updated_at) VALUES ($1, NULL, $2, $3, $4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [
          eventId,
          stage,
          EVENT_COPY_BY_STAGE[stage].title,
          EVENT_COPY_BY_STAGE[stage].description,
        ],
      );

      await this.db.execute(
        "INSERT INTO application_events (application_id, event_id) VALUES ($1, $2)",
        [applicationId, eventId],
      );
    }
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
         ${this.effectiveEventFlowStatusSelectClause}
       FROM applications
       ${this.latestEventJoinClause}
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
        : orderByClause;

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM applications
           ${this.latestEventJoinClause}
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
             ${this.effectiveEventFlowStatusSelectClause}
           FROM applications
           ${this.latestEventJoinClause}
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
             ${this.effectiveEventFlowStatusSelectClause}
           FROM applications
           ${this.latestEventJoinClause}
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
        status,
        event_flow_status,
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
        $19,
        $20,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      `,
      [
        id,
        parseResult.data.companyId ?? null,
        title,
        String(parseResult.data.status ?? ApplicationStatus.Saved),
        String(
          parseResult.data.eventFlowStatus ??
            ApplicationEventFlowStatus.Applied,
        ),
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
    await this.ensureFlowEventsLinked(
      id,
      String(
        parseResult.data.eventFlowStatus ?? ApplicationEventFlowStatus.Applied,
      ),
    );

    return id;
  }

  async update(payload: ApplicationUpdatePayload): Promise<void> {
    const currentStatusRows = await this.db.select<{
      event_flow_status: string;
    }>("SELECT event_flow_status FROM applications WHERE id = $1 LIMIT 1", [
      payload.id,
    ]);
    const currentEventFlowStatus = currentStatusRows[0]?.event_flow_status;

    await this.db.execute(
      `
      UPDATE applications
      SET
        company_id = $1,
        title = $2,
        status = $3,
        event_flow_status = $4,
        source_url = $5,
        applied_at = $6,
        location_text = $7,
        location_lat = $8,
        location_lng = $9,
        attendance_type = $10,
        employment_type = $11,
        salary_min = $12,
        salary_max = $13,
        currency = $14,
        description = $15,
        interview_process = $16,
        benefits = $17,
        priority = $18,
        is_archived = $19,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      `,
      [
        payload.companyId ?? null,
        payload.title,
        String(payload.status),
        String(payload.eventFlowStatus),
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

    if (currentEventFlowStatus !== String(payload.eventFlowStatus)) {
      await this.ensureFlowEventsLinked(
        payload.id,
        String(payload.eventFlowStatus),
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(
      "UPDATE applications SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );
  }
}
