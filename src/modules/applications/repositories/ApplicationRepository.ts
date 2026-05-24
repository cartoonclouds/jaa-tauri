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
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
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

  private async withTags(application: Application): Promise<Application> {
    return {
      ...application,
      tagIds: await listTagIdsForEntity(this.db, "application", application.id),
    };
  }

  async list(): Promise<Application[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "applications",
        whereClause: "is_deleted = 0",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
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

    const orderByClause = resolveOrderByClause({
      sortField: query.sortField,
      sortOrder: query.sortOrder,
      sortableColumns: APPLICATION_SORTABLE_COLUMN_MAP,
      fallbackClause: DEFAULT_CREATED_AT_ORDER_BY,
    });

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM applications
           WHERE is_deleted = 0
             AND (${searchWhereClause})`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM applications
           WHERE is_deleted = 0`,
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM applications
           WHERE is_deleted = 0
             AND (${searchWhereClause})
           ORDER BY ${orderByClause}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM applications
           WHERE is_deleted = 0
           ORDER BY ${orderByClause}
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
        parseResult.data.status?.value ?? ApplicationStatus.Saved.value,
        parseResult.data.eventFlowStatus?.value ??
          ApplicationEventFlowStatus.Applied.value,
        payload.sourceUrl ?? null,
        payload.appliedAt ?? null,
        parseResult.data.locationText ?? null,
        parseResult.data.locationLat ?? null,
        parseResult.data.locationLng ?? null,
        payload.attendanceType?.value ?? null,
        payload.employmentType?.value ?? null,
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

    return id;
  }

  async update(payload: ApplicationUpdatePayload): Promise<void> {
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
        payload.status.value,
        payload.eventFlowStatus.value,
        payload.sourceUrl ?? null,
        payload.appliedAt ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
        payload.attendanceType?.value ?? null,
        payload.employmentType?.value ?? null,
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
      "UPDATE applications SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );
  }
}
