<script setup lang="ts">
  import AppOnboardingWizard from "@modules/onboarding/presentation/components/AppOnboardingWizard.vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  async function handleCompleted(): Promise<void> {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
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
