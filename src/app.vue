<script setup lang="ts">
  import { logError, logInfo } from "@infra/logging/tauriLog.client";
  import { useProfileService } from "@modules/profile";
  import {
    getOnboardingCompleted,
    setOnboardingCompleted,
  } from "@modules/settings/persistence";
  import { invoke, isTauri } from "@tauri-apps/api/core";
  import { onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { useOnboardingNavigation } from "@/composables/useOnboardingNavigation.client";

  const { openOnboarding } = useOnboardingNavigation();
  const profileService = useProfileService();

  onMounted(async () => {
    if (import.meta.client && isTauri()) {
      try {
        await invoke("close_splashscreen");
      } catch (error) {
        logError("Failed to close splashscreen:", error);
      }
    }

    try {
      const [onboardingCompleted, profiles] = await Promise.all([
        getOnboardingCompleted(),
        profileService.list(),
      ]);
      const profileExists = profiles.length > 0;

      logInfo(
        `Onboarding state loaded: completed=${String(onboardingCompleted)} profiles=${String(profiles.length)}`,
      );

      if (!onboardingCompleted && profileExists) {
        await setOnboardingCompleted(true);
      }

      const shouldOpenOnboarding = !onboardingCompleted && !profileExists;
      if (!shouldOpenOnboarding) {
        return;
      }

      await openOnboarding();
    } catch (error) {
      logError("Failed to load onboarding state:", error);
    }
  });
</script>

<template>
  <div class="app-dark min-h-screen">
    <NuxtLayout>
      <NuxtPage />
      <Toast />
    </NuxtLayout>
  </div>
</template>
