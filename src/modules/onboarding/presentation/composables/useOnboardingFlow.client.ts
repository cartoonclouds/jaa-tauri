import type { ParsedResume } from "@modules/onboarding/domain/entities/ParsedResume";
import type { UserProfile } from "@shared/settings/types";

import { useDocumentService } from "@modules/documents";
import { completeOnboarding } from "@modules/onboarding/application/actions/CompleteOnboarding";
import {
  isSupportedResumePath,
  mergeCommaSeparated,
} from "@modules/onboarding/application/actions/onboardingHelpers";
import { getUserProfile } from "@shared/settings";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useStepper } from "@vueuse/core";
import { computed, ref } from "vue";

const stepOrder = ["profile", "preferences", "resume", "review"] as const;

type OnboardingStep = (typeof stepOrder)[number];

type StepErrors = Partial<Record<OnboardingStep, string>>;

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

export function useOnboardingFlow() {
  const stepper = useStepper(stepOrder);
  const documentService = useDocumentService();

  const profile = ref<UserProfile>(defaultProfile());
  const saving = ref(false);
  const parsingResume = ref(false);
  const errors = ref<StepErrors>({});
  const globalError = ref("");
  const hydrating = ref(false);

  const skillsInput = ref("");
  const locationsInput = ref("");

  const resumePath = ref<string | null>(null);
  const parsedResume = ref<ParsedResume | null>(null);

  const currentStep = computed<OnboardingStep>(
    () => stepper.current.value as OnboardingStep,
  );

  const currentError = computed(() => errors.value[currentStep.value] ?? "");

  async function hydrateExistingData(): Promise<void> {
    try {
      hydrating.value = true;

      const [existingProfile, documents] = await Promise.all([
        getUserProfile(),
        documentService.list(),
      ]);

      profile.value = {
        ...defaultProfile(),
        ...(existingProfile ?? {}),
        preferredLocations: [...(existingProfile?.preferredLocations ?? [])],
        skills: [...(existingProfile?.skills ?? [])],
      };

      const latestResume = documents.find(
        (document) => document.kind === "resume",
      );
      if (latestResume?.filePath) {
        resumePath.value = latestResume.filePath;
      }
    } catch (error) {
      console.error("Failed to hydrate onboarding data:", error);
    } finally {
      hydrating.value = false;
    }
  }

  function addSkills(): void {
    profile.value.skills = mergeCommaSeparated(
      skillsInput.value,
      profile.value.skills,
    );
    skillsInput.value = "";
  }

  function addLocations(): void {
    profile.value.preferredLocations = mergeCommaSeparated(
      locationsInput.value,
      profile.value.preferredLocations,
    );
    locationsInput.value = "";
  }

  function removeSkill(skill: string): void {
    profile.value.skills = profile.value.skills.filter(
      (item) => item !== skill,
    );
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

  async function pickAndParseResume(): Promise<void> {
    globalError.value = "";
    errors.value.resume = "";

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Resume",
            extensions: ["pdf", "docx"],
          },
        ],
      });

      const selectedPath = normalizeSelectedPath(selected);
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
      errors.value.resume =
        error instanceof Error
          ? error.message
          : "Unable to parse selected resume file.";
    } finally {
      parsingResume.value = false;
    }
  }

  async function finishOnboarding(): Promise<void> {
    globalError.value = "";

    try {
      saving.value = true;

      if (skillsInput.value.trim()) {
        addSkills();
      }

      if (locationsInput.value.trim()) {
        addLocations();
      }

      await completeOnboarding({
        profile: profile.value,
        resumePath: resumePath.value,
      });
    } catch (error) {
      globalError.value =
        error instanceof Error ? error.message : "Failed to save onboarding.";
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
    skillsInput,
    locationsInput,
    resumePath,
    parsedResume,
    parsingResume,
    hydrating,
    saving,
    globalError,
    currentError,
    errors,
    addSkills,
    addLocations,
    removeSkill,
    removeLocation,
    nextStep,
    previousStep,
    pickAndParseResume,
    finishOnboarding,
    validateStep,
  };
}
