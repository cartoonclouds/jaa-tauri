import type { Profile } from "@modules/profile/domain/entities/Profile";
import type {
  ProfileCreatePayload,
  ProfileUpdatePayload,
} from "@modules/profile/types";

import { ProfileRepository } from "@modules/profile/repositories/ProfileRepository";
import { ProfileService } from "@modules/profile/services/ProfileService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createProfileService(): ProfileService {
  const database = getNuxtDatabase();
  return new ProfileService(new ProfileRepository(database));
}

let profileServiceInstance: ProfileService | null = null;

function getProfileService(): ProfileService {
  profileServiceInstance ??= createProfileService();

  return profileServiceInstance;
}

/**
 * Creates profile composable.
 */
function createProfileComposable() {
  const service = getProfileService();
  const crudComposable = createCrudComposable<
    Profile,
    ProfileCreatePayload,
    ProfileUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
}

/**
 * Type alias for profile composable.
 */
type ProfileComposable = ReturnType<typeof createProfileComposable>;

let profileComposableInstance: ProfileComposable | null = null;

/**
 * Create CRUD state and handlers for profiles.
 */
export function useProfile() {
  profileComposableInstance ??= createProfileComposable();

  return profileComposableInstance;
}
