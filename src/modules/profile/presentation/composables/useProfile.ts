import type { Profile } from "@modules/profile/domain/entities/Profile";
import type {
  ProfileCreatePayload,
  ProfileUpdatePayload,
} from "@modules/profile/repositories/ProfileRepository";

import { useProfileService } from "@modules/profile/services/useProfileService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for profiles.
 */
export function useProfile() {
  const service = useProfileService();
  return createCrudComposable<
    Profile,
    ProfileCreatePayload,
    ProfileUpdatePayload
  >(service);
}
