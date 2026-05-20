import type { UserProfile } from "@shared/settings/types";

import { type Profile, ProfileSchema } from "@shared/domain/zod/profile.schema";
// Map Zod Profile to UserProfile interface
function zodProfileToUserProfile(profile: Profile): UserProfile {
  return {
    fullName: profile.fullName,
    email: profile.email ?? "",
    targetRole: profile.headline ?? "",
    desiredSalary: profile.desiredSalary ?? null,
    salaryCurrency: profile.salaryCurrency,
    preferredLocations: profile.preferredLocations,
    remotePreference: profile.remotePreference,
    skills: profile.skills,
    linkedInUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    workEligibility: profile.workEligibility ?? "",
    noticePeriodDays: profile.noticePeriodDays ?? null,
    interviewAvailability: profile.interviewAvailability ?? "",
  };
}

import { useDocumentService } from "@modules/documents";
import { useSettingsService } from "@shared/settings";

import { getResumeDocumentTitle } from "./onboardingHelpers";

export interface CompleteOnboardingInput {
  profile: UserProfile;
  resumePath: string | null;
}

export async function completeOnboarding(
  input: CompleteOnboardingInput,
): Promise<void> {
  // Validate profile with Zod before saving
  const parseResult = ProfileSchema.safeParse(input.profile);
  if (!parseResult.success) {
    throw new Error(
      "Profile validation failed: " +
        JSON.stringify(parseResult.error.format()),
    );
  }
  const settingsService = useSettingsService();
  await settingsService.profileService.set(
    zodProfileToUserProfile(parseResult.data),
  );

  if (input.resumePath) {
    const documentService = useDocumentService();
    await documentService.create({
      title: getResumeDocumentTitle(input.resumePath),
      kind: "resume",
      filePath: input.resumePath,
      mimeType: null,
      sizeBytes: null,
      checksum: null,
    });
  }

  await settingsService.profileService.setOnboardingCompleted(true);
}
