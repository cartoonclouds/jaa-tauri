import type { Application } from "@modules/applications/domain/entities/Application";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import { EnumValue } from "@shared/domain/enums";
import {
  fromDbBoolean,
  mapAuditTimestamps,
  mapOptionalRowDate,
  toFiniteNumber,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

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
    id: toRequiredString(row.id),
    companyId: toNullableString(row.company_id),
    title: toRequiredString(row.title),
    status:
      EnumValue.mapFromDbValue(row.status, ApplicationStatus) ??
      ApplicationStatus.Saved,
    eventFlowStatus:
      EnumValue.mapFromDbValue(
        row.event_flow_status,
        ApplicationEventFlowStatus,
      ) ?? ApplicationEventFlowStatus.Saved,
    url: toNullableString(row.url),
    appliedAt: mapOptionalRowDate(row.applied_at),
    locationText: toNullableString(row.location_text),
    locationLat: (row.location_lat as number | null) ?? null,
    locationLng: (row.location_lng as number | null) ?? null,
    attendanceType: EnumValue.mapFromDbValue(
      row.attendance_type,
      ApplicationAttendanceType,
    ),
    employmentType: EnumValue.mapFromDbValue(
      row.employment_type,
      ApplicationEmploymentType,
    ),
    salaryMin: (row.salary_min as number | null) ?? null,
    salaryMax: (row.salary_max as number | null) ?? null,
    currency: toNullableString(row.currency),
    description: toNullableString(row.description),
    interviewProcess: toNullableString(row.interview_process),
    benefits: toNullableString(row.benefits),
    tagIds: [],
    priority: toFiniteNumber(row.priority, 3),
    isArchived: fromDbBoolean(row.is_archived, false),
    isDeleted: row.deleted_at !== null,
    ...timestamps,
  };
}
