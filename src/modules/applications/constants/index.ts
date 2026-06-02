import type { ApplicationSelectOption } from "@modules/applications/types";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";

/**
 * Searchable database-backed fields used by the applications datatable.
 */
export const APPLICATION_SEARCH_FIELDS = [
  "title",
  "status",
  "event_flow_status",
  "attendance_type",
  "location_text",
  "employment_type",
] as const;

/**
 * Search field union derived from `APPLICATION_SEARCH_FIELDS`.
 */
export type ApplicationSearchField = (typeof APPLICATION_SEARCH_FIELDS)[number];

/**
 * UI option metadata for selectable search fields.
 */
export interface ApplicationSearchFieldOption {
  label: string;
  value: ApplicationSearchField;
}

/**
 * Search options rendered in datatable search controls.
 */
export const APPLICATION_SEARCH_FIELD_OPTIONS: readonly ApplicationSearchFieldOption[] =
  [
    { label: "Title", value: "title" },
    { label: "Status", value: "status" },
    { label: "Event Flow", value: "event_flow_status" },
    { label: "Attendance Type", value: "attendance_type" },
    { label: "Employment Type", value: "employment_type" },
    { label: "Location", value: "location_text" },
  ];

/**
 * Mapping of UI sortable keys to underlying persistence columns.
 */
export const APPLICATION_SORTABLE_COLUMN_MAP = {
  title: "title",
  status: "status",
  eventFlowStatus: "event_flow_status",
  attendanceType: "attendance_type",
  locationText: "location_text",
  priority: "priority",
  employmentType: "employment_type",
  createdAt: "created_at",
  updatedAt: "updated_at",
} as const;

/**
 * Sortable field union derived from the sortable column map.
 */
export type ApplicationSortableField =
  keyof typeof APPLICATION_SORTABLE_COLUMN_MAP;

/**
 * Immutable list of sortable field keys allowed by the applications datatable.
 */
export const APPLICATION_SORTABLE_FIELDS = Object.freeze(
  Object.keys(APPLICATION_SORTABLE_COLUMN_MAP) as ApplicationSortableField[],
);

/** Select options used for application status fields. */
export const APPLICATION_STATUS_OPTIONS: ApplicationSelectOption<ApplicationStatus>[] =
  ApplicationStatus.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

/** Select options used for attendance type fields. */
export const APPLICATION_ATTENDANCE_OPTIONS: ApplicationSelectOption<ApplicationAttendanceType>[] =
  ApplicationAttendanceType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));

/** Select options used for employment type fields. */
export const APPLICATION_EMPLOYMENT_OPTIONS: ApplicationSelectOption<ApplicationEmploymentType>[] =
  ApplicationEmploymentType.values().map((instance) => ({
    label: instance.toLabel(),
    value: instance,
  }));
