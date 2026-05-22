import type { Application } from "@modules/applications/domain/entities/Application";

import { useApplicationService } from "@modules/applications";

import { useServerDatatable } from "@/composables/useServerDatatable";

const APPLICATION_SEARCH_FIELDS = ["title", "status", "location_text"] as const;

export type ApplicationSearchField = (typeof APPLICATION_SEARCH_FIELDS)[number];

export interface ApplicationSearchFieldOption {
  label: string;
  value: ApplicationSearchField;
}

export const APPLICATION_SORTABLE_FIELDS = [
  "title",
  "status",
  "locationText",
  "priority",
  "createdAt",
  "updatedAt",
] as const;

export type ApplicationSortableField =
  (typeof APPLICATION_SORTABLE_FIELDS)[number];

const APPLICATION_SEARCH_FIELD_OPTIONS = [
  { label: "Title", value: "title" },
  { label: "Status", value: "status" },
  { label: "Location", value: "location_text" },
] satisfies readonly ApplicationSearchFieldOption[];

/**
 * Create server-backed datatable state for applications.
 */
export function useApplicationDatatable() {
  const service = useApplicationService();

  const datatable = useServerDatatable<
    Application,
    ApplicationSearchField,
    ApplicationSortableField
  >({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...APPLICATION_SEARCH_FIELDS],
  });

  return {
    ...datatable,
    searchFieldOptions: [...APPLICATION_SEARCH_FIELD_OPTIONS],
  };
}
