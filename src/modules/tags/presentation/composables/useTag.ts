import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  TagCreatePayload,
  TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

import { useTagService } from "@modules/tags/services/useTagService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for tags.
 */
export function useTag() {
  const service = useTagService();
  return createCrudComposable<Tag, TagCreatePayload, TagUpdatePayload>(service);
}
