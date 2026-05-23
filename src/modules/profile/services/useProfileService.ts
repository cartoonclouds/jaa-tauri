import { ProfileRepository } from "@modules/profile/repositories/ProfileRepository";
import { ProfileService } from "@modules/profile/services/ProfileService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let profileServiceInstance: ProfileService | null = null;

/**
 * Create a profile service instance backed by the injected database driver.
 */
export function useProfileService(): ProfileService {
  if (!profileServiceInstance) {
    const database = getNuxtDatabase();
    profileServiceInstance = new ProfileService(
      new ProfileRepository(database),
    );
  }

  return profileServiceInstance;
}
