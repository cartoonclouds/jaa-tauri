import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  TagCreatePayload,
  TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

import { useTagService } from "@modules/tags";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

function createTagComposable() {
  const service = useTagService();
  return createCrudComposable<Tag, TagCreatePayload, TagUpdatePayload>(service);
}

type TagComposable = ReturnType<typeof createTagComposable>;

let tagComposableInstance: TagComposable | null = null;

/**
 * Create CRUD state and handlers for tags.
 */
export function useTag() {
  tagComposableInstance ??= createTagComposable();

  return tagComposableInstance;
}
