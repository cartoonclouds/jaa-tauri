<script setup lang="ts">
  import { useOnboardingFlow } from "@modules/onboarding/presentation/composables/useOnboardingFlow.client";
  import { defaultSkillOptions } from "@modules/onboarding/presentation/constants/defaultSkillOptions";
  import { computed, ref } from "vue";

  import {
    Button,
    Card,
    Dialog,
    FileUpload,
    InputNumber,
    InputText,
    Message,
    MultiSelect,
    Select,
    Tag,
    Textarea,
  } from "#components";

  interface AppOnboardingWizardProps {
    showCloseButton?: boolean;
  }

  const props = withDefaults(defineProps<AppOnboardingWizardProps>(), {
    showCloseButton: false,
  });

  const emit = defineEmits<{
    completed: [];
    cancelled: [];
  }>();

  const {
    addLocations,
    currentError,
    currentStep,
    finishOnboarding,
    globalError,
    isFirstStep,
    isLastStep,
    locationsInput,
    nextStep,
    parsedResume,
    parsingResume,
    hydrating,
    pickAndParseResume,
    previousStep,
    profile,
    removeLocation,
    resumePath,
    saving,
    stepOrder,
  } = useOnboardingFlow();

  const skillOptions = computed(() => {
    const detectedSkills = parsedResume.value?.detectedSkills ?? [];
    const options = new Set<string>([
      ...defaultSkillOptions,
      ...detectedSkills,
      ...profile.value.skills,
    ]);

    return Array.from(options).sort((left, right) => left.localeCompare(right));
  });

  const stepLabels = {
    profile: "Profile",
    preferences: "Preferences",
    resume: "Resume",
    review: "Review",
  } as const;

  const canMoveBack = computed(() => !isFirstStep.value);
  const showCancelConfirmDialog = ref(false);

  const hasPotentialUnsavedChanges = computed(() => {
    const hasProfileText =
      profile.value.fullName.trim().length > 0 ||
      profile.value.email.trim().length > 0 ||
      profile.value.targetRole.trim().length > 0 ||
      profile.value.salaryCurrency.trim().length > 0 ||
      profile.value.linkedInUrl.trim().length > 0 ||
      profile.value.githubUrl.trim().length > 0 ||
      profile.value.workEligibility.trim().length > 0 ||
      profile.value.interviewAvailability.trim().length > 0;
    const hasCollections =
      profile.value.skills.length > 0 ||
      profile.value.preferredLocations.length > 0;
    const hasNumericValues =
      profile.value.desiredSalary !== null ||
      profile.value.noticePeriodDays !== null;
    const hasResumeData =
      (resumePath.value ?? "").trim().length > 0 || parsedResume.value !== null;

    return (
      hasProfileText || hasCollections || hasNumericValues || hasResumeData
    );
  });

  function onResumeFileSelect(event: unknown): void {
    const selected = event as {
      files?: (File & { path?: string })[];
    };
    const selectedFile = selected.files?.[0] ?? null;
    void pickAndParseResume(selectedFile);
  }

  async function onFinish(): Promise<void> {
    try {
      await finishOnboarding();
      emit("completed");
    } catch {
      // Error state is handled in composable and shown in the UI.
    }
  }

  function onCancel(): void {
    if (hasPotentialUnsavedChanges.value) {
      showCancelConfirmDialog.value = true;
      return;
    }

    emit("cancelled");
  }

  function onConfirmCancel(): void {
    showCancelConfirmDialog.value = false;
    emit("cancelled");
  }

  function onDismissCancelDialog(): void {
    showCancelConfirmDialog.value = false;
  }
</script>

<template>
  <Card class="w-full shadow-2xl">
    <template #title>
      <div class="flex items-center justify-between gap-3">
        <span>Welcome to Apply-Flow</span>
        <Button
          v-if="props.showCloseButton"
          severity="secondary"
          text
          @click="onCancel"
        >
          <Icon name="heroicons:x-mark" class="h-4 w-4" />
          <span>Close</span>
        </Button>
      </div>
    </template>
    <template #subtitle>
      Complete onboarding once to personalize your workspace and parse your
      resume for ATS-ready details.
    </template>

    <template #content>
      <Dialog
        v-model:visible="showCancelConfirmDialog"
        modal
        header="Discard onboarding changes?"
        :style="{ width: '28rem' }"
      >
        <p class="text-sm text-surface-600">
          You have unsaved onboarding changes. Closing now will discard your
          current progress.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <Button
              label="Stay"
              severity="secondary"
              text
              @click="onDismissCancelDialog"
            />
            <Button
              label="Discard & Close"
              severity="danger"
              @click="onConfirmCancel"
            />
          </div>
        </template>
      </Dialog>

      <Message v-if="hydrating" severity="info" class="mb-4">
        Loading existing onboarding details...
      </Message>

      <div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div
          v-for="(step, index) in stepOrder"
          :key="step"
          class="rounded-lg border px-3 py-2"
          :class="
            currentStep === step
              ? 'border-primary bg-primary/10'
              : 'border-surface-300'
          "
        >
          <p class="text-xs text-surface-500">Step {{ index + 1 }}</p>
          <p class="font-medium">{{ stepLabels[step] }}</p>
        </div>
      </div>

      <div v-if="currentStep === 'profile'" class="grid gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="fullName">Full Name</label>
            <InputText id="fullName" v-model="profile.fullName" fluid />
          </div>
          <div class="flex flex-col gap-2">
            <label for="email">Email</label>
            <InputText id="email" v-model="profile.email" type="email" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="targetRole">Target Role</label>
          <InputText id="targetRole" v-model="profile.targetRole" fluid />
        </div>
      </div>

      <div v-else-if="currentStep === 'preferences'" class="grid gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="desiredSalary">Desired Salary</label>
            <InputNumber
              id="desiredSalary"
              v-model="profile.desiredSalary"
              :min="0"
              fluid
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="currency">Currency</label>
            <InputText id="currency" v-model="profile.salaryCurrency" fluid />
          </div>
          <div class="flex flex-col gap-2">
            <label for="remotePreference">Remote Preference</label>
            <Select
              id="remotePreference"
              v-model="profile.remotePreference"
              :options="['remote', 'hybrid', 'onsite', 'flexible']"
              fluid
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="noticePeriodDays">Notice Period (days)</label>
            <InputNumber
              id="noticePeriodDays"
              v-model="profile.noticePeriodDays"
              :min="0"
              fluid
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="skills">Skills</label>
            <MultiSelect
              id="skills"
              v-model="profile.skills"
              :options="skillOptions"
              display="chip"
              placeholder="Select skills"
              filter
              fluid
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="locationsInput"
              >Preferred Locations (comma-separated)</label
            >
            <div class="flex gap-2">
              <InputText
                id="locationsInput"
                v-model="locationsInput"
                fluid
                @keyup.enter="addLocations"
              />
              <Button label="Add" @click="addLocations" />
            </div>
            <div
              v-if="profile.preferredLocations.length"
              class="flex flex-wrap gap-2"
            >
              <Tag
                v-for="location in profile.preferredLocations"
                :key="location"
                :value="location"
                severity="info"
                class="cursor-pointer"
                @click="removeLocation(location)"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentStep === 'resume'" class="grid gap-4">
        <div class="flex flex-col gap-2">
          <p class="text-sm text-surface-600">
            Upload a PDF or DOCX resume. The app extracts keywords and role
            hints for ATS-style matching.
          </p>
          <div class="flex flex-wrap gap-2">
            <FileUpload
              mode="basic"
              name="resume"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              :choose-label="parsingResume ? 'Parsing...' : 'Upload Resume'"
              :disabled="parsingResume"
              custom-upload
              auto
              @select="onResumeFileSelect"
            >
              <template #chooseicon>
                <Icon name="heroicons:arrow-up-tray" class="h-4 w-4" />
              </template>
            </FileUpload>
            <Tag v-if="resumePath" :value="resumePath" severity="contrast" />
          </div>
        </div>

        <div v-if="parsedResume" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-lg border border-surface-300 p-3">
            <p class="font-semibold mb-2">Detected Skills</p>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="skill in parsedResume.detectedSkills"
                :key="skill"
                :value="skill"
                severity="success"
              />
            </div>
          </div>

          <div class="rounded-lg border border-surface-300 p-3">
            <p class="font-semibold mb-2">Inferred Target Roles</p>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="role in parsedResume.inferredTargetRoles"
                :key="role"
                :value="role"
                severity="warn"
              />
            </div>
          </div>
        </div>

        <div
          v-if="parsedResume"
          class="rounded-lg border border-surface-300 p-3"
        >
          <p class="font-semibold mb-2">Extract Preview</p>
          <p class="text-sm whitespace-pre-line line-clamp-6">
            {{ parsedResume.extractedText.slice(0, 1200) }}
          </p>
        </div>
      </div>

      <div v-else class="grid gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="linkedInUrl">LinkedIn URL</label>
            <InputText id="linkedInUrl" v-model="profile.linkedInUrl" fluid />
          </div>
          <div class="flex flex-col gap-2">
            <label for="githubUrl">GitHub URL</label>
            <InputText id="githubUrl" v-model="profile.githubUrl" fluid />
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="workEligibility">Work Eligibility</label>
            <InputText
              id="workEligibility"
              v-model="profile.workEligibility"
              fluid
            />
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="interviewAvailability">Interview Availability</label>
            <Textarea
              id="interviewAvailability"
              v-model="profile.interviewAvailability"
              rows="3"
              fluid
            />
          </div>
        </div>

        <div class="rounded-lg border border-surface-300 p-3 text-sm">
          <p>
            <span class="font-semibold">Profile:</span>
            {{ profile.fullName }} · {{ profile.targetRole }}
          </p>
          <p>
            <span class="font-semibold">Resume:</span>
            {{ resumePath ?? "Not uploaded" }}
          </p>
        </div>
      </div>

      <Message v-if="currentError" severity="error" class="mt-4">{{
        currentError
      }}</Message>
      <Message v-if="globalError" severity="error" class="mt-4">{{
        globalError
      }}</Message>

      <div class="pt-6 flex justify-between">
        <Button
          severity="secondary"
          :disabled="!canMoveBack"
          @click="previousStep"
        >
          <Icon name="heroicons:arrow-left" class="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button v-if="!isLastStep" @click="nextStep">
          <span>Next</span>
          <Icon name="heroicons:arrow-right" class="h-4 w-4" />
        </Button>

        <Button
          v-else
          :label="saving ? 'Saving...' : 'Finish Setup'"
          :disabled="saving"
          @click="onFinish"
        >
          <Icon name="heroicons:check" class="h-4 w-4" />
        </Button>
      </div>
    </template>
  </Card>
</template>
