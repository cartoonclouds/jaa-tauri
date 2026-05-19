import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Application } from "@modules/applications/domain/entities/Application";

export async function listApplications(
  db: DatabaseDriver,
): Promise<Application[]> {
  const rows = await db.select<Record<string, unknown>>(
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
