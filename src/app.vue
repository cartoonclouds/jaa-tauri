<script setup lang="ts">
  import { useProfileService } from "@modules/profile";
  import {
    getOnboardingCompleted,
    setOnboardingCompleted,
  } from "@modules/settings/persistence";
  import { toErrorMessage } from "@shared/utils/error";
  import { invoke, isTauri } from "@tauri-apps/api/core";
  import { onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { useChildWebviewWindow } from "@/composables/useChildWebviewWindow.client";

  const { openChildWebviewWindow } = useChildWebviewWindow();
  const profileService = useProfileService();

  onMounted(async () => {
    if (import.meta.client && isTauri()) {
      try {
        await invoke("close_splashscreen");
      } catch (error) {
        console.error("Failed to close splashscreen:", toErrorMessage(error));
      }
    }

    try {
      const [onboardingCompleted, profiles] = await Promise.all([
        getOnboardingCompleted(),
        profileService.list(),
      ]);
      const profileExists = profiles.length > 0;

      console.error("Onboarding state loaded:", onboardingCompleted, profiles);

      if (!onboardingCompleted && profileExists) {
        await setOnboardingCompleted(true);
      }

      const shouldOpenOnboarding = !onboardingCompleted && !profileExists;
      if (!shouldOpenOnboarding) {
        return;
      }

      if (!import.meta.client) {
        return;
      }

      await openChildWebviewWindow({
        label: "onboarding-modal",
        url: "/onboarding",
        title: "Complete Onboarding",
      });
    } catch (error) {
      console.error("Failed to load onboarding state:", toErrorMessage(error));
    }
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>
