<script setup lang="ts">
  import AppOnboardingWizard from "@modules/onboarding/presentation/components/AppOnboardingWizard.vue";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  async function handleCompleted(): Promise<void> {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      console.error("Failed to close onboarding window:", error);
    }
  }
</script>

<template>
  <div class="min-h-screen p-4 bg-surface-100 dark:bg-surface-900">
    <AppOnboardingWizard @completed="handleCompleted" />
  </div>
</template>
