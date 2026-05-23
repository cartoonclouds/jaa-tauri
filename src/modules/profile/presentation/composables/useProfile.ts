import type { Profile } from "@modules/profile/domain/entities/Profile";
import type {
  ProfileCreatePayload,
  ProfileUpdatePayload,
} from "@modules/profile/repositories/ProfileRepository";

import { useProfileService } from "@modules/profile";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates profile composable.
 */
function createProfileComposable() {
  const service = useProfileService();
  return createCrudComposable<
    Profile,
    ProfileCreatePayload,
    ProfileUpdatePayload
  >(service);
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








