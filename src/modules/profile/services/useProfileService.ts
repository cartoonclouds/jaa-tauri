import { ProfileRepository } from "@modules/profile/repositories/ProfileRepository";
import { ProfileService } from "@modules/profile/services/ProfileService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create a profile service instance backed by the injected database driver.
 */
export function useProfileService(): ProfileService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new ProfileService(new ProfileRepository(database));
}
