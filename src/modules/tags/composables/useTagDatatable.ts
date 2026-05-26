import type { Tag } from "@modules/tags/domain/entities/Tag";

import { useTag } from "@modules/tags";
import {
  TAG_SEARCH_FIELDS,
  type TagSearchField,
} from "@modules/tags/constants/tagDatatableFields";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for tags.
 */
export function useTagDatatable() {
  const { service } = useTag();

  return useServerDatatable<Tag, TagSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...TAG_SEARCH_FIELDS],
  });
}
