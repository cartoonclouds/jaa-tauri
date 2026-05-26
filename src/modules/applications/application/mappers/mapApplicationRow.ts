import type { Application } from "@modules/applications/domain/entities/Application";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/types/enums";
import { mapEnumFromDbValue } from "@shared/utils/enum";
import { toFiniteNumber } from "@shared/utils/numberValueUtils";
import { fromDbBoolean } from "@shared/utils/persistenceValueUtils";
import {
  mapAuditTimestamps,
  mapOptionalRowDate,
} from "@shared/utils/rowDateUtils";

/**
 * Map a raw database row into a typed application entity.
 */
export function mapApplicationRowToEntity(
  row: Record<string, unknown>,
): Application {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: String(row.id),
    companyId: (row.company_id as string | null) ?? null,
    title: String(row.title),
    status:
      mapEnumFromDbValue(row.status, ApplicationStatus) ??
      ApplicationStatus.Saved,
    eventFlowStatus:
      mapEnumFromDbValue(row.event_flow_status, ApplicationEventFlowStatus) ??
      ApplicationEventFlowStatus.Saved,
    sourceUrl: (row.source_url as string | null) ?? null,
    appliedAt: mapOptionalRowDate(row.applied_at),
    locationText: (row.location_text as string | null) ?? null,
    locationLat: (row.location_lat as number | null) ?? null,
    locationLng: (row.location_lng as number | null) ?? null,
    attendanceType: mapEnumFromDbValue(
      row.attendance_type,
      ApplicationAttendanceType,
    ),
    employmentType: mapEnumFromDbValue(
      row.employment_type,
      ApplicationEmploymentType,
    ),
    salaryMin: (row.salary_min as number | null) ?? null,
    salaryMax: (row.salary_max as number | null) ?? null,
    currency: (row.currency as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    interviewProcess: (row.interview_process as string | null) ?? null,
    benefits: (row.benefits as string | null) ?? null,
    tagIds: [],
    priority: toFiniteNumber(row.priority, 3),
    isArchived: fromDbBoolean(row.is_archived, false),
    isDeleted: row.deleted_at !== null,
    ...timestamps,
  };
}
