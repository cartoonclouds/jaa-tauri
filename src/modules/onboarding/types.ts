import type { UserProfile } from "@modules/profile/domain/entities/UserProfile";

/**
 * Input contract for completing onboarding and optional resume import.
 */
export interface CompleteOnboardingInput {
  profile: UserProfile;
  resumePath: string | null;
  resumeMimeType?: string | null;
}
