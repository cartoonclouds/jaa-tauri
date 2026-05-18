import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationRow,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@modules/applications/domain/types/ApplicationType";
import type { DatabaseDriver } from "~/services/database/DatabaseDriver";

import { mapApplicationRow } from "./applicationMapper";

export class ApplicationRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async all(): Promise<Application[]> {
    const rows = await this.db.select<ApplicationRow>(
      `
      SELECT
        id,
        company_id,
        company_name_snapshot,
        job_title,
        status,
        applied_at,
        source_id,
        source_platform,
        job_advert_url,
        salary_min,
        salary_max,
        salary_currency,
        contract_type,
        location_text,
        work_mode,
        priority,
        notes,
        is_archived,
        is_deleted,
        closed_at,
        created_at,
        updated_at
      FROM applications
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      `,
    );

    return rows.map(mapApplicationRow);
  }

  async find(id: string): Promise<Application | null> {
    const rows = await this.db.select<ApplicationRow>(
      `
      SELECT
        id,
        company_id,
        company_name_snapshot,
        job_title,
        status,
        applied_at,
        source_id,
        source_platform,
        job_advert_url,
        salary_min,
        salary_max,
        salary_currency,
        contract_type,
        location_text,
        work_mode,
        priority,
        notes,
        is_archived,
        is_deleted,
        closed_at,
        created_at,
        updated_at
      FROM applications
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ? mapApplicationRow(rows[0]) : null;
  }

  async create(input: CreateApplicationInput): Promise<Application> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db.execute(
      `
      INSERT INTO applications (
        id,
        company_id,
        company_name_snapshot,
        job_title,
        status,
        applied_at,
        source_id,
        source_platform,
        job_advert_url,
        salary_min,
        salary_max,
        salary_currency,
        contract_type,
        location_text,
        work_mode,
        priority,
        notes,
        is_archived,
        is_deleted,
        closed_at,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      )
      `,
      [
        id,
        input.companyId ?? null,
        input.companyNameSnapshot,
        input.jobTitle,
        input.status ?? "saved",
        input.appliedAt ?? null,
        input.sourceId ?? null,
        input.sourcePlatform ?? null,
        input.jobAdvertUrl ?? null,
        input.salaryMin ?? null,
        input.salaryMax ?? null,
        input.salaryCurrency ?? null,
        input.contractType ?? null,
        input.locationText ?? null,
        input.workMode ?? "unknown",
        input.priority ?? 3,
        input.notes ?? null,
        0,
        0,
        null,
        now,
        now,
      ],
    );

    const application = await this.find(id);

    if (!application) {
      throw new Error(`Failed to create application ${id}`);
    }

    return application;
  }

  async update(input: UpdateApplicationInput): Promise<Application> {
    const existing = await this.find(input.id);

    if (!existing) {
      throw new Error(`Application ${input.id} not found`);
    }

    await this.db.execute(
      `
      UPDATE applications
      SET
        company_id = $1,
        company_name_snapshot = $2,
        job_title = $3,
        status = $4,
        applied_at = $5,
        source_id = $6,
        source_platform = $7,
        job_advert_url = $8,
        salary_min = $9,
        salary_max = $10,
        salary_currency = $11,
        contract_type = $12,
        location_text = $13,
        work_mode = $14,
        priority = $15,
        notes = $16,
        is_archived = $17,
        is_deleted = $18,
        closed_at = $19,
        updated_at = $20
      WHERE id = $21
      `,
      [
        input.companyId ?? existing.companyId,
        input.companyNameSnapshot ?? existing.companyNameSnapshot,
        input.jobTitle ?? existing.jobTitle,
        input.status ?? existing.status,
        input.appliedAt === undefined ? existing.appliedAt : input.appliedAt,
        input.sourceId === undefined ? existing.sourceId : input.sourceId,
        input.sourcePlatform === undefined
          ? existing.sourcePlatform
          : input.sourcePlatform,
        input.jobAdvertUrl === undefined
          ? existing.jobAdvertUrl
          : input.jobAdvertUrl,
        input.salaryMin === undefined ? existing.salaryMin : input.salaryMin,
        input.salaryMax === undefined ? existing.salaryMax : input.salaryMax,
        input.salaryCurrency === undefined
          ? existing.salaryCurrency
          : input.salaryCurrency,
        input.contractType === undefined
          ? existing.contractType
          : input.contractType,
        input.locationText === undefined
          ? existing.locationText
          : input.locationText,
        input.workMode ?? existing.workMode,
        input.priority ?? existing.priority,
        input.notes === undefined ? existing.notes : input.notes,
        input.isArchived === undefined
          ? existing.isArchived
            ? 1
            : 0
          : input.isArchived
            ? 1
            : 0,
        input.isDeleted === undefined
          ? existing.isDeleted
            ? 1
            : 0
          : input.isDeleted
            ? 1
            : 0,
        input.closedAt === undefined ? existing.closedAt : input.closedAt,
        new Date().toISOString(),
        input.id,
      ],
    );

    const application = await this.find(input.id);

    if (!application) {
      throw new Error(`Application ${input.id} not found after update`);
    }

    return application;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(
      `
      UPDATE applications
      SET
        is_deleted = 1,
        updated_at = $1
      WHERE id = $2
      `,
      [new Date().toISOString(), id],
    );
  }
}
