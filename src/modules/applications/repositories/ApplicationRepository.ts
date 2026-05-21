import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";
import type { IRepository } from "@shared/types";

import { toDate, toNullableDate } from "@shared/utils/toDate";

export interface IApplicationRepository extends IRepository<
  Application,
  ApplicationCreatePayload,
  ApplicationUpdatePayload
> {}

export class ApplicationRepository implements IApplicationRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Application[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM applications WHERE is_deleted = 0 ORDER BY created_at DESC",
    );

    return rows.map((row) => ({
      id: String(row.id),
      companyId: (row.company_id as string | null) ?? null,
      title: String(row.title),
      status: String(row.status),
      sourceUrl: (row.source_url as string | null) ?? null,
      appliedAt: toNullableDate(row.applied_at),
      locationText: (row.location_text as string | null) ?? null,
      locationLat: (row.location_lat as number | null) ?? null,
      locationLng: (row.location_lng as number | null) ?? null,
      attendanceType:
        (row.attendance_type as Application["attendanceType"]) ?? null,
      employmentType:
        (row.employment_type as Application["employmentType"]) ?? null,
      salaryMin: (row.salary_min as number | null) ?? null,
      salaryMax: (row.salary_max as number | null) ?? null,
      currency: (row.currency as string | null) ?? null,
      description: (row.description as string | null) ?? null,
      interviewProcess: (row.interview_process as string | null) ?? null,
      benefits: (row.benefits as string | null) ?? null,
      priority: Number(row.priority ?? 3),
      isArchived: Number(row.is_archived ?? 0) === 1,
      isDeleted: Number(row.is_deleted ?? 0) === 1,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    }));
  }

  async create(payload: ApplicationCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      `
      INSERT INTO applications (
        id,
        company_id,
        title,
        status,
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
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      `,
      [
        id,
        payload.companyId ?? null,
        payload.title,
        payload.status ?? "saved",
        payload.sourceUrl ?? null,
        payload.appliedAt ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
        payload.attendanceType ?? null,
        payload.employmentType ?? null,
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
        source_url = $4,
        applied_at = $5,
        location_text = $6,
        location_lat = $7,
        location_lng = $8,
        attendance_type = $9,
        employment_type = $10,
        salary_min = $11,
        salary_max = $12,
        currency = $13,
        description = $14,
        interview_process = $15,
        benefits = $16,
        priority = $17,
        is_archived = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      `,
      [
        payload.companyId,
        payload.title,
        payload.status,
        payload.sourceUrl,
        payload.appliedAt,
        payload.locationText,
        payload.locationLat,
        payload.locationLng,
        payload.attendanceType,
        payload.employmentType,
        payload.salaryMin,
        payload.salaryMax,
        payload.currency,
        payload.description,
        payload.interviewProcess,
        payload.benefits,
        payload.priority,
        payload.isArchived ? 1 : 0,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(
      "UPDATE applications SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );
  }
}
