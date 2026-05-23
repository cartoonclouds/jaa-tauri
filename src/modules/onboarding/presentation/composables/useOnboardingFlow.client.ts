import type { ParsedResume } from "@modules/onboarding/domain/entities/ParsedResume";
import type { Profile, UserProfile } from "@modules/profile";

import { logError } from "@infra/logging/tauriLog.client";
import { useDocumentService } from "@modules/documents";
import {
  getResumeMimeType,
  isSupportedResumePath,
  mergeCommaSeparated,
} from "@modules/onboarding/utils/onboardingUtils";
import { useProfileService } from "@modules/profile";
import { toErrorMessage } from "@shared/utils/error";
import { invoke } from "@tauri-apps/api/core";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useStepper } from "@vueuse/core";
import { computed, ref } from "vue";

import { useFileSystem } from "@/composables/useFileSystem";

import { onboardingRepository } from "../../repositories/OnboardingRepository";

const stepOrder = ["profile", "preferences", "resume", "review"] as const;

/**
 * Type alias for onboarding step.
 */
type OnboardingStep = (typeof stepOrder)[number];

/**
 * Type alias for step errors.
 */
type StepErrors = Partial<Record<OnboardingStep, string>>;

/**
 * Create default profile values for onboarding.
 */
function defaultProfile(): UserProfile {
  return {
    fullName: "",
    email: "",
    targetRole: "",
    desiredSalary: null,
    salaryCurrency: "USD",
    preferredLocations: [],
    remotePreference: "flexible",
    skills: [],
    linkedInUrl: "",
    githubUrl: "",
    workEligibility: "",
    noticePeriodDays: null,
    interviewAvailability: "",
  };
}

/**
 * Map persisted profile data into the onboarding form shape.
 */
function mapProfileToUserProfile(profile: Profile): UserProfile {
  return {
    fullName: profile.fullName,
    email: profile.email ?? "",
    targetRole: profile.headline ?? "",
    desiredSalary: profile.desiredSalary ?? null,
    salaryCurrency: profile.salaryCurrency,
    preferredLocations: [...profile.preferredLocations],
    remotePreference: profile.remotePreference,
    skills: [...profile.skills],
    linkedInUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    workEligibility: profile.workEligibility,
    noticePeriodDays: profile.noticePeriodDays ?? null,
    interviewAvailability: profile.interviewAvailability,
  };
}

/**
 * Normalize the Tauri dialog selection into a single file path.
 */
function normalizeSelectedPath(
  selectedPath: string | string[] | null,
): string | null {
  if (typeof selectedPath === "string") {
    return selectedPath;
  }

  if (Array.isArray(selectedPath)) {
    return selectedPath[0] ?? null;
  }

  return null;
}

/**
 * Creates onboarding flow composable.
 */
function createOnboardingFlowComposable() {
  const stepper = useStepper(stepOrder);
  const documentService = useDocumentService();
  const profileService = useProfileService();
  const { sanitizeFileName, writeBrowserFileToAppLocalData } = useFileSystem({
    ensureDirectoryExists: true,
  });

  const profile = ref<UserProfile>(defaultProfile());
  const saving = ref(false);
  const parsingResume = ref(false);
  const errors = ref<StepErrors>({});
  const globalError = ref("");
  const hydrating = ref(false);

  const locationsInput = ref("");

  const resumePath = ref<string | null>(null);
  const resumeMimeType = ref<string | null>(null);
  const parsedResume = ref<ParsedResume | null>(null);

  const currentStep = computed<OnboardingStep>(
    () => stepper.current.value as OnboardingStep,
  );

  const currentError = computed(() => errors.value[currentStep.value] ?? "");

  async function hydrateExistingData(): Promise<void> {
    try {
      hydrating.value = true;

      const [profiles, documents] = await Promise.all([
        profileService.list(),
        documentService.list(),
      ]);

      const existingProfile = profiles[0] ?? null;

      profile.value = existingProfile
        ? mapProfileToUserProfile(existingProfile)
        : defaultProfile();

      const latestResume = documents.find(
        (document) => document.kind === "resume",
      );
      if (latestResume?.filePath) {
        resumePath.value = latestResume.filePath;
        resumeMimeType.value = latestResume.mimeType;
      }
    } catch (error) {
      logError("Failed to hydrate onboarding data:", toErrorMessage(error));
    } finally {
      hydrating.value = false;
    }
  }

  function addLocations(): void {
    profile.value.preferredLocations = mergeCommaSeparated(
      locationsInput.value,
      profile.value.preferredLocations,
    );
    locationsInput.value = "";
  }

  function removeLocation(location: string): void {
    profile.value.preferredLocations = profile.value.preferredLocations.filter(
      (item) => item !== location,
    );
  }

  function validateStep(step: OnboardingStep): boolean {
    errors.value[step] = "";

    if (step === "profile") {
      if (!profile.value.fullName.trim()) {
        errors.value.profile = "Please enter your full name.";
        return false;
      }

      if (!profile.value.targetRole.trim()) {
        errors.value.profile = "Please enter your target role.";
        return false;
      }
    }

    if (step === "resume" && resumePath.value && !parsedResume.value) {
      errors.value.resume =
        "Resume parsing is still required for the selected file.";
      return false;
    }

    return true;
  }

  function nextStep(): void {
    const step = currentStep.value;
    if (!validateStep(step)) {
      return;
    }

    if (!stepper.isLast.value) {
      stepper.goToNext();
    }
  }

  function previousStep(): void {
    if (!stepper.isFirst.value) {
      stepper.goToPrevious();
    }
  }

  async function saveResumeFileToLocalData(file: File): Promise<string> {
    const baseDir = await appLocalDataDir();
    const safeName = sanitizeFileName(file.name || "resume.pdf");
    const timestamp = Date.now().toString();
    const destinationPath = await join(
      baseDir,
      "onboarding",
      "resumes",
      `${timestamp}-${safeName}`,
    );

    await writeBrowserFileToAppLocalData(file, destinationPath, {
      create: true,
    });

    return destinationPath;
  }

  async function pickAndParseResume(
    selectedInput: string | File | null = null,
  ): Promise<void> {
    globalError.value = "";
    errors.value.resume = "";

    try {
      let selectedPath: string | null;

      if (typeof selectedInput === "string") {
        selectedPath = selectedInput;
        resumeMimeType.value = getResumeMimeType(selectedPath);
      } else if (selectedInput instanceof File) {
        selectedPath = await saveResumeFileToLocalData(selectedInput);
        resumeMimeType.value = getResumeMimeType(
          selectedInput.name || selectedPath,
          selectedInput.type,
        );
      } else {
        selectedPath = normalizeSelectedPath(
          await open({
            multiple: false,
            directory: false,
            filters: [
              {
                name: "Resume",
                extensions: ["pdf", "docx"],
              },
            ],
          }),
        );
        if (selectedPath) {
          resumeMimeType.value = getResumeMimeType(selectedPath);
        }
      }

      if (!selectedPath) {
        return;
      }

      if (!isSupportedResumePath(selectedPath)) {
        errors.value.resume = "Only PDF and DOCX files are supported.";
        return;
      }

      resumePath.value = selectedPath;
      parsingResume.value = true;

      parsedResume.value = await invoke<ParsedResume>("parse_resume_for_ats", {
        filePath: selectedPath,
      });

      if (parsedResume.value.detectedSkills.length > 0) {
        profile.value.skills = mergeCommaSeparated(
          parsedResume.value.detectedSkills.join(","),
          profile.value.skills,
        );
      }
    } catch (error) {
      parsedResume.value = null;
      errors.value.resume = toErrorMessage(
        error,
        "Unable to parse selected resume file.",
      );
    } finally {
      parsingResume.value = false;
    }
  }

  async function finishOnboarding(): Promise<void> {
    globalError.value = "";

    try {
      saving.value = true;

      if (locationsInput.value.trim()) {
        addLocations();
      }

      await onboardingRepository.complete({
        profile: profile.value,
        resumePath: resumePath.value,
        resumeMimeType: resumeMimeType.value,
      });
    } catch (error) {
      globalError.value = toErrorMessage(error, "Failed to save onboarding.");
      throw error;
    } finally {
      saving.value = false;
    }
  }

  void hydrateExistingData();

  return {
    stepOrder,
    currentStep,
    isFirstStep: stepper.isFirst,
    isLastStep: stepper.isLast,
    profile,
    locationsInput,
    resumePath,
    resumeMimeType,
    parsedResume,
    parsingResume,
    hydrating,
    saving,
    globalError,
    currentError,
    errors,
    addLocations,
    removeLocation,
    nextStep,
    previousStep,
    pickAndParseResume,
    finishOnboarding,
    validateStep,
  };
}

/**
 * Type alias for onboarding flow composable.
 */
type OnboardingFlowComposable = ReturnType<
  typeof createOnboardingFlowComposable
>;

let onboardingFlowComposableInstance: OnboardingFlowComposable | null = null;

/**
 * Orchestrate onboarding form state, validation, resume parsing, and submission.
 */
export function useOnboardingFlow() {
  onboardingFlowComposableInstance ??= createOnboardingFlowComposable();

  return onboardingFlowComposableInstance;
}








