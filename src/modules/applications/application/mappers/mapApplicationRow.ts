import type { Application } from "@modules/applications/domain/entities/Application";

import { toDate, toNullableDate } from "@shared/utils/toDate";

export function mapApplicationRowToEntity(
  row: Record<string, unknown>,
): Application {
  return {
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
      (row.attendance_type as import("../../types/enums").ApplicationAttendanceType) ??
      null,
    employmentType:
      (row.employment_type as import("../../types/enums").ApplicationEmploymentType) ??
      null,
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
  };
}
