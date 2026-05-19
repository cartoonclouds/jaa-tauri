import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Application } from "@modules/applications/domain/entities/Application";

export interface ApplicationCreatePayload {
  companyId?: string | null;
  title: string;
  status?: string;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}

export interface ApplicationUpdatePayload {
  id: string;
  title?: string;
  status?: string;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}

export class ApplicationRepository {
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
      appliedAt: (row.applied_at as string | null) ?? null,
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
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
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
        location_text,
        location_lat,
        location_lng,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        id,
        payload.companyId ?? null,
        payload.title,
        payload.status ?? "saved",
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
      ],
    );
    return id;
  }

  async update(payload: ApplicationUpdatePayload): Promise<void> {
    await this.db.execute(
      `
      UPDATE applications
      SET
        title = COALESCE($1, title),
        status = COALESCE($2, status),
        location_text = COALESCE($3, location_text),
        location_lat = COALESCE($4, location_lat),
        location_lng = COALESCE($5, location_lng),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      `,
      [
        payload.title ?? null,
        payload.status ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
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
