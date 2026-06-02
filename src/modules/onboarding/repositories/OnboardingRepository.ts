import type {
  ProfileCreatePayload,
  ProfileUpdatePayload,
  UserProfile,
} from "@modules/profile";

import { useDocument } from "@modules/documents";
import { useProfile } from "@modules/profile";
import { CreateProfileSchema } from "@modules/profile/domain/zod/profile.schema";
import { setOnboardingCompleted } from "@modules/settings/persistence";
import { ValidationError } from "@shared/domain/errors";

import {
  getResumeDocumentTitle,
  getResumeMimeType,
} from "../utils/onboardingUtils";

/**
 * Maps onboarding profile input to the profile create payload shape.
 */
function userProfileToProfileCreatePayload(
  profile: UserProfile,
): ProfileCreatePayload {
  return {
    fullName: profile.fullName,
    email: profile.email || null,
    phone: null,
    linkedinUrl: profile.linkedInUrl || null,
    githubUrl: profile.githubUrl || null,
    portfolioUrl: null,
    headline: profile.targetRole || null,
    summary: null,
    locationText: null,
    desiredSalary: profile.desiredSalary ?? null,
    salaryCurrency: profile.salaryCurrency,
    preferredLocations: profile.preferredLocations,
    remotePreference: profile.remotePreference,
    skills: profile.skills,
    workEligibility: profile.workEligibility,
    noticePeriodDays: profile.noticePeriodDays ?? null,
    interviewAvailability: profile.interviewAvailability,
  };
}

/**
 * Input contract for completing onboarding and optional resume import.
 */
export interface CompleteOnboardingInput {
  profile: UserProfile;
  resumePath: string | null;
  resumeMimeType?: string | null;
}

/**
 * Coordinates onboarding persistence across profile, document, and settings modules.
 */
export class OnboardingRepository {
  async complete(input: CompleteOnboardingInput): Promise<void> {
    const payload = userProfileToProfileCreatePayload(input.profile);
    const parseResult = CreateProfileSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new ValidationError(
        "Profile validation failed: " +
          JSON.stringify(parseResult.error.format()),
      );
    }

    const { service: profileService } = useProfile();
    const existingProfiles = await profileService.list();

    if (existingProfiles[0]) {
      const updatePayload: ProfileUpdatePayload = {
        id: existingProfiles[0].id,
        ...payload,
      };
      await profileService.update(updatePayload);
    } else {
      await profileService.create(payload);
    }

    if (input.resumePath) {
      const { service: documentService } = useDocument();
      await documentService.create({
        title: getResumeDocumentTitle(input.resumePath),
        kind: "resume",
        filePath: input.resumePath,
        mimeType: getResumeMimeType(input.resumePath, input.resumeMimeType),
        sizeBytes: null,
        checksum: null,
      });
    }

    await setOnboardingCompleted(true);
  }
}

/** Shared singleton repository instance for onboarding flows. */
export const onboardingRepository = new OnboardingRepository();

/**
 * Completes onboarding using the shared repository instance.
 */
export async function completeOnboarding(
  input: CompleteOnboardingInput,
): Promise<void> {
  await onboardingRepository.complete(input);
}
