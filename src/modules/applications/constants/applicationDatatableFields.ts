/**
 * Searchable database-backed fields used by the applications datatable.
 */
export const APPLICATION_SEARCH_FIELDS = [
  "title",
  "status",
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
