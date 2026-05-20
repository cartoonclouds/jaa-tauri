<script setup lang="ts">
  import { useProfileService } from "@modules/profile";
  import {
    getOnboardingCompleted,
    getUserProfile,
    setOnboardingCompleted,
  } from "@shared/settings";
  import { onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { useChildWebviewWindow } from "@/composables/useChildWebviewWindow.client";

  const { openChildWebviewWindow } = useChildWebviewWindow();
  const profileService = useProfileService();

  onMounted(async () => {
    try {
      const [onboardingCompleted, profile] = await Promise.all([
        getOnboardingCompleted(),
        getUserProfile(),
      ]);
      const profileExists = !!profile;

      console.error("Onboarding state loaded:", onboardingCompleted, profile);

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

      const profile2 = await profileService.list();

      console.debug("Opening onboarding modal...", {
        onboardingCompleted,
        profile,
        profile2,
      });

      await openChildWebviewWindow({
        label: "onboarding-modal",
        url: "/onboarding",
        title: "Complete Onboarding",
      });
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
    }
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>
