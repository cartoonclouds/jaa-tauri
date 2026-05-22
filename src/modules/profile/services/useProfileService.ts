import { ProfileRepository } from "@modules/profile/repositories/ProfileRepository";
import { ProfileService } from "@modules/profile/services/ProfileService";
import { useNuxtApp } from "nuxt/app";

let profileServiceInstance: ProfileService | null = null;

/**
 * Create a profile service instance backed by the injected database driver.
 */
export function useProfileService(): ProfileService {
  if (!profileServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    profileServiceInstance = new ProfileService(
      new ProfileRepository(database),
    );
  }

  return profileServiceInstance;
}
