export const APPLICATION_SEARCH_FIELDS = [
  "title",
  "status",
  "attendance_type",
  "location_text",
  "employment_type",
] as const;

export type ApplicationSearchField = (typeof APPLICATION_SEARCH_FIELDS)[number];

export interface ApplicationSearchFieldOption {
  label: string;
  value: ApplicationSearchField;
}

export const APPLICATION_SEARCH_FIELD_OPTIONS: readonly ApplicationSearchFieldOption[] =
  [
    { label: "Title", value: "title" },
    { label: "Status", value: "status" },
    { label: "Attendance Type", value: "attendance_type" },
    { label: "Employment Type", value: "employment_type" },
    { label: "Location", value: "location_text" },
  ];

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

export type ApplicationSortableField =
  keyof typeof APPLICATION_SORTABLE_COLUMN_MAP;

export const APPLICATION_SORTABLE_FIELDS = Object.freeze(
  Object.keys(APPLICATION_SORTABLE_COLUMN_MAP) as ApplicationSortableField[],
);
