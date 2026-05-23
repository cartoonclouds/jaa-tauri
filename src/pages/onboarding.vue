<script setup lang="ts">
  import { logError } from "@infra/logging/tauriLog.client";
  import AppOnboardingWizard from "@modules/onboarding/presentation/components/AppOnboardingWizard.vue";
  import { toErrorMessage } from "@shared/utils/error";
  import { isTauri } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { useRouter } from "vue-router";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  const router = useRouter();

  async function handleCompleted(): Promise<void> {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      logError("Failed to close onboarding window:", toErrorMessage(error));
    }
  }

  async function handleCancelled(): Promise<void> {
    try {
      if (isTauri()) {
        await getCurrentWindow().close();
        return;
      }

      await router.push("/");
    } catch (error) {
      logError("Failed to cancel onboarding:", toErrorMessage(error));
    }
  }
</script>

<template>
  <div class="min-h-screen p-4 bg-surface-100 dark:bg-surface-900">
    <AppOnboardingWizard
      :show-close-button="true"
      @completed="handleCompleted"
      @cancelled="handleCancelled"
    />
  </div>
</template>
