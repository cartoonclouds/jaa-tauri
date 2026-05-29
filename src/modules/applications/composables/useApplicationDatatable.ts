import type { Application } from "@modules/applications/domain/entities/Application";

import { useApplication } from "@modules/applications";
import {
  APPLICATION_SEARCH_FIELD_OPTIONS,
  APPLICATION_SEARCH_FIELDS,
  APPLICATION_SORTABLE_FIELDS,
  type ApplicationSearchField,
  type ApplicationSearchFieldOption,
  type ApplicationSortableField,
} from "@modules/applications/constants";

import { useServerDatatable } from "@/composables/useServerDatatable";

export {
  APPLICATION_SEARCH_FIELDS,
  APPLICATION_SORTABLE_FIELDS,
  type ApplicationSearchField,
  type ApplicationSearchFieldOption,
  type ApplicationSortableField,
};

/**
 * Create server-backed datatable state for applications.
 */
export function useApplicationDatatable() {
  const { service } = useApplication();

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
