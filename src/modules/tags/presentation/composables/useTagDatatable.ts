import type { Tag } from "@modules/tags/domain/entities/Tag";

import {
  TAG_SEARCH_FIELDS,
  type TagSearchField,
} from "@modules/tags/constants/tagDatatableFields";
import { useTagService } from "@modules/tags/services/useTagService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for tags.
 */
export function useTagDatatable() {
  const service = useTagService();

  return useServerDatatable<Tag, TagSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...TAG_SEARCH_FIELDS],
  });
}



