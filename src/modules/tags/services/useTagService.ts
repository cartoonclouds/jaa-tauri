import { TagRepository } from "@modules/tags/repositories/TagRepository";
import { TagService } from "@modules/tags/services/TagService";
import { useNuxtApp } from "nuxt/app";

let tagServiceInstance: TagService | null = null;

/**
 * Create a tag service instance backed by the injected database driver.
 */
export function useTagService(): TagService {
  if (!tagServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    tagServiceInstance = new TagService(new TagRepository(database));
  }

  return tagServiceInstance;
}
