<script setup lang="ts">
  import type { AppSettings } from "@shared/settings/types";

  import { checkForUpdates } from "@modules/updates";
  import { initializeSettingsStore } from "@shared/settings";
  import { LazyStore } from "@tauri-apps/plugin-store";
  import { onBeforeUnmount, onMounted } from "vue";
  import { ref } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import ProfileOnboardingStepper from "@/components/ui/ProfileOnboardingStepper.vue";
  import { setupNativeContextMenu } from "@/composables/useNativeContextMenu";

  let cleanupContextMenu: (() => void | Promise<void>) | null = null;
  const showProfileOnboarding = ref(false);

  onMounted(async () => {
    // Initialize app settings from Tauri Store
    try {
      await initializeSettingsStore();

      const store = new LazyStore("settings.json");
      const settings = await store.get<AppSettings>("app-settings");
      showProfileOnboarding.value = !settings?.onboardingCompleted;
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
    <!-- <ProfileOnboardingStepper
      v-if="showProfileOnboarding"
      @completed="showProfileOnboarding = false"
    /> -->
    <Toast />
  </NuxtLayout>
</template>
