<script setup lang="ts">
  import { checkForUpdates } from "@modules/updates";
  import { initializeSettingsStore } from "@shared/settings";
  import { onBeforeUnmount, onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { setupNativeContextMenu } from "@/composables/useNativeContextMenu";

  let cleanupContextMenu: (() => void | Promise<void>) | null = null;

  onMounted(async () => {
    // Initialize app settings from Tauri Store
    try {
      await initializeSettingsStore();
    } catch (error) {
      console.error("Failed to initialize settings:", error);
    }

    cleanupContextMenu = await setupNativeContextMenu();
    await checkForUpdates();
  });

  onBeforeUnmount(async () => {
    if (cleanupContextMenu) {
      await cleanupContextMenu();
      cleanupContextMenu = null;
    }
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>
