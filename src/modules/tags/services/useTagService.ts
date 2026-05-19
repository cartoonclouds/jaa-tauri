import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { TagRepository } from "@modules/tags/repositories/TagRepository";
import { TagService } from "@modules/tags/services/TagService";
import { useNuxtApp } from "nuxt/app";

export function useTagService(): TagService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new TagService(new TagRepository(database));
}
