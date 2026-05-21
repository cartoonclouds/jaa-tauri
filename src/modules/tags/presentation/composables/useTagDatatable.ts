import type { Tag } from "@modules/tags/domain/entities/Tag";

import { useTagService } from "@modules/tags/services/useTagService";

import { useServerDatatable } from "@/composables/useServerDatatable";

export function useTagDatatable() {
  const service = useTagService();

  return useServerDatatable<Tag>({
    fetchPage: (query) => service.listPage(query),
  });
}
