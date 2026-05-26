import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  TagCreatePayload,
  TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

import { TagRepository } from "@modules/tags/repositories/TagRepository";
import { TagService } from "@modules/tags/services/TagService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createTagService(): TagService {
  const database = getNuxtDatabase();
  return new TagService(new TagRepository(database));
}

let tagServiceInstance: TagService | null = null;

function getTagService(): TagService {
  tagServiceInstance ??= createTagService();

  return tagServiceInstance;
}

/**
 * Creates tag composable.
 */
function createTagComposable() {
  const service = getTagService();
  const crudComposable = createCrudComposable<
    Tag,
    TagCreatePayload,
    TagUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
}

/**
 * Type alias for tag composable.
 */
type TagComposable = ReturnType<typeof createTagComposable>;

let tagComposableInstance: TagComposable | null = null;

/**
 * Create CRUD state and handlers for tags.
 */
export function useTag() {
  tagComposableInstance ??= createTagComposable();

  return tagComposableInstance;
}
