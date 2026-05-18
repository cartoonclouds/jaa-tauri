<script setup lang="ts">
  import type { AppSettings, UserProfile } from "@shared/settings/types";

  import { LazyStore } from "@tauri-apps/plugin-store";
  import { ref } from "vue";

  import {
    Button,
    Card,
    InputNumber,
    InputText,
    Message,
    Select,
    Step,
    StepList,
    StepPanel,
    StepPanels,
    Stepper,
    Tag,
    Textarea,
  } from "#components";

  const emit = defineEmits<{
    completed: [];
  }>();

  const activeStep = ref("1");
  const saving = ref(false);
  const errorMessage = ref("");
  const skillsInput = ref("");
  const locationsInput = ref("");

  const profile = ref<UserProfile>({
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
  });

  function addItems(input: string, current: string[]): string[] {
    return input
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .reduce<string[]>(
        (acc, value) => {
          if (!acc.includes(value)) {
            acc.push(value);
          }
          return acc;
        },
        [...current],
      );
  }

  function addSkills() {
    profile.value.skills = addItems(skillsInput.value, profile.value.skills);
    skillsInput.value = "";
  }

  function addLocations() {
    profile.value.preferredLocations = addItems(
      locationsInput.value,
      profile.value.preferredLocations,
    );
    locationsInput.value = "";
  }

  function removeSkill(skill: string) {
    profile.value.skills = profile.value.skills.filter(
      (item) => item !== skill,
    );
  }

  function removeLocation(location: string) {
    profile.value.preferredLocations = profile.value.preferredLocations.filter(
      (item) => item !== location,
    );
  }

  function validateStep1(): boolean {
    if (!profile.value.fullName.trim()) {
      errorMessage.value = "Please enter your full name.";
      return false;
    }

    if (!profile.value.targetRole.trim()) {
      errorMessage.value = "Please enter your target role.";
      return false;
    }

    errorMessage.value = "";
    return true;
  }

  async function completeOnboarding() {
    try {
      saving.value = true;
      errorMessage.value = "";

      if (skillsInput.value.trim()) {
        addSkills();
      }

      if (locationsInput.value.trim()) {
        addLocations();
      }

      const store = new LazyStore("settings.json");
      const current =
        (await store.get<Partial<AppSettings>>("app-settings")) ?? {};

      await store.set("app-settings", {
        ...current,
        userProfile: profile.value,
        onboardingCompleted: true,
      });
      await store.save();

      emit("completed");
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Failed to save profile.";
    } finally {
      saving.value = false;
    }
  }
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <Card class="w-full max-w-4xl shadow-2xl">
      <template #title> Welcome to Job Application Auditor </template>
      <template #subtitle>
        Complete your profile to personalize your job search workspace.
      </template>
      <template #content>
        <Stepper v-model:value="activeStep" linear>
          <StepList>
            <Step value="1">Profile</Step>
            <Step value="2">Preferences</Step>
            <Step value="3">Review</Step>
          </StepList>

          <StepPanels>
            <StepPanel v-slot="{ activateCallback }" value="1">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="fullName">Full Name</label>
                  <InputText id="fullName" v-model="profile.fullName" fluid />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="email">Email</label>
                  <InputText
                    id="email"
                    v-model="profile.email"
                    type="email"
                    fluid
                  />
                </div>
                <div class="flex flex-col gap-2 md:col-span-2">
                  <label for="targetRole">Target Role</label>
                  <InputText
                    id="targetRole"
                    v-model="profile.targetRole"
                    fluid
                  />
                </div>
              </div>

              <div class="pt-6 flex justify-end">
                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  @click="
                    () => {
                      if (validateStep1()) activateCallback('2');
                    }
                  "
                />
              </div>
            </StepPanel>

            <StepPanel v-slot="{ activateCallback }" value="2">
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
                  <InputText
                    id="currency"
                    v-model="profile.salaryCurrency"
                    fluid
                  />
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

              <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div
                    v-if="profile.skills.length"
                    class="flex flex-wrap gap-2"
                  >
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

              <div class="pt-6 flex justify-between">
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('1')"
                />
                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  @click="activateCallback('3')"
                />
              </div>
            </StepPanel>

            <StepPanel v-slot="{ activateCallback }" value="3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="linkedInUrl">LinkedIn URL</label>
                  <InputText
                    id="linkedInUrl"
                    v-model="profile.linkedInUrl"
                    fluid
                  />
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
                  <label for="interviewAvailability"
                    >Interview Availability</label
                  >
                  <Textarea
                    id="interviewAvailability"
                    v-model="profile.interviewAvailability"
                    rows="3"
                    fluid
                  />
                </div>
              </div>

              <Message v-if="errorMessage" severity="error" class="mt-4">{{
                errorMessage
              }}</Message>

              <div class="pt-6 flex justify-between">
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('2')"
                />
                <Button
                  :label="saving ? 'Saving...' : 'Finish Setup'"
                  :disabled="saving"
                  icon="pi pi-check"
                  @click="completeOnboarding"
                />
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </template>
    </Card>
  </div>
</template>
