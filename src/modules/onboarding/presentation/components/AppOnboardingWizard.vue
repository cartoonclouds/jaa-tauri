<script setup lang="ts">
  import { useOnboardingFlow } from "@modules/onboarding/presentation/composables/useOnboardingFlow.client";
  import { computed } from "vue";

  import {
    Button,
    Card,
    InputNumber,
    InputText,
    Message,
    Select,
    Tag,
    Textarea,
  } from "#components";

  const emit = defineEmits<{
    completed: [];
  }>();

  const {
    addLocations,
    addSkills,
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
    removeSkill,
    resumePath,
    saving,
    skillsInput,
    stepOrder,
  } = useOnboardingFlow();

  const stepLabels = {
    profile: "Profile",
    preferences: "Preferences",
    resume: "Resume",
    review: "Review",
  } as const;

  const canMoveBack = computed(() => !isFirstStep.value);

  async function onFinish(): Promise<void> {
    try {
      await finishOnboarding();
      emit("completed");
    } catch {
      // Error state is handled in composable and shown in the UI.
    }
  }
</script>

<template>
  <Card class="w-full shadow-2xl">
    <template #title>Welcome to Apply-Flow</template>
    <template #subtitle>
      Complete onboarding once to personalize your workspace and parse your
      resume for ATS-ready details.
    </template>

    <template #content>
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
            <label for="skillsInput">Skills (comma-separated)</label>
            <div class="flex gap-2">
              <InputText
                id="skillsInput"
                v-model="skillsInput"
                fluid
                @keyup.enter="addSkills"
              />
              <Button label="Add" @click="addSkills" />
            </div>
            <div v-if="profile.skills.length" class="flex flex-wrap gap-2">
              <Tag
                v-for="skill in profile.skills"
                :key="skill"
                :value="skill"
                severity="secondary"
                class="cursor-pointer"
                @click="removeSkill(skill)"
              />
            </div>
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
            <Button
              :label="parsingResume ? 'Parsing...' : 'Upload Resume'"
              icon="pi pi-upload"
              :disabled="parsingResume"
              @click="pickAndParseResume"
            />
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
          label="Back"
          severity="secondary"
          icon="pi pi-arrow-left"
          :disabled="!canMoveBack"
          @click="previousStep"
        />

        <Button
          v-if="!isLastStep"
          label="Next"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="nextStep"
        />

        <Button
          v-else
          :label="saving ? 'Saving...' : 'Finish Setup'"
          :disabled="saving"
          icon="pi pi-check"
          @click="onFinish"
        />
      </div>
    </template>
  </Card>
</template>
