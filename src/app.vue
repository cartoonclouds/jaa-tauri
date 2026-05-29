<script setup lang="ts">
  import { logError, logInfo } from "@infra/logging/tauriLog.client";
  import CompaniesDialog from "@modules/companies/presentation/components/dialogs/CompaniesDialog.vue";
  import ContactsDialog from "@modules/contacts/presentation/components/dialogs/ContactsDialog.vue";
  import { useProfile } from "@modules/profile";
  import {
    getOnboardingCompleted,
    setOnboardingCompleted,
  } from "@modules/settings/persistence";
  import SettingsDialog from "@modules/settings/presentation/components/dialogs/SettingsDialog.vue";
  import { invoke, isTauri } from "@tauri-apps/api/core";
  import { onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
  import { useContactsDialog } from "@/composables/useContactsDialog";
  import { useOnboardingNavigation } from "@/composables/useOnboardingNavigation.client";
  import { useSettingsDialog } from "@/composables/useSettingsDialog";

  const { openOnboarding } = useOnboardingNavigation();
  const { isCompaniesDialogVisible } = useCompaniesDialog();
  const { isContactsDialogVisible } = useContactsDialog();
  const { isSettingsDialogVisible } = useSettingsDialog();
  const { service: profileService } = useProfile();

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
      <CompaniesDialog v-model:visible="isCompaniesDialogVisible" />
      <ContactsDialog v-model:visible="isContactsDialogVisible" />
      <SettingsDialog v-model:visible="isSettingsDialogVisible" />
      <Toast />
    </NuxtLayout>
  </div>
</template>
