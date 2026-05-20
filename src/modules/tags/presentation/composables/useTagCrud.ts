import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  TagCreatePayload,
  TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

import { useTagService } from "@modules/tags/services/useTagService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

export function useTagCrud() {
  const service = useTagService();
  return createCrudComposable<Tag, TagCreatePayload, TagUpdatePayload>(service);
}
