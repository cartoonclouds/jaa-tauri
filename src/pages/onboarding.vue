<script setup lang="ts">
  import { logError } from "@infra/logging/tauriLog.client";
  import AppOnboardingWizard from "@modules/onboarding/presentation/components/AppOnboardingWizard.vue";
  import { toErrorMessage } from "@shared/utils/error";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  async function handleCompleted(): Promise<void> {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      logError("Failed to close onboarding window:", toErrorMessage(error));
    }
  }
</script>

<template>
  <div class="min-h-screen p-4 bg-surface-100 dark:bg-surface-900">
    <AppOnboardingWizard @completed="handleCompleted" />
  </div>
</template>
