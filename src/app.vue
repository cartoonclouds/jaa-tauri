<script setup lang="ts">
  import { logError, logInfo } from "@infra/logging/tauriLog.client";
  import CompaniesModal from "@modules/companies/presentation/components/modals/CompaniesModal.vue";
  import ContactsModal from "@modules/contacts/presentation/components/modals/ContactsModal.vue";
  import { useProfileService } from "@modules/profile";
  import {
    getOnboardingCompleted,
    setOnboardingCompleted,
  } from "@modules/settings/persistence";
  import SettingsModal from "@modules/settings/presentation/components/modals/SettingsModal.vue";
  import { invoke, isTauri } from "@tauri-apps/api/core";
  import { onMounted } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { useCompaniesModal } from "@/composables/useCompaniesModal";
  import { useContactsModal } from "@/composables/useContactsModal";
  import { useOnboardingNavigation } from "@/composables/useOnboardingNavigation.client";
  import { useSettingsModal } from "@/composables/useSettingsModal";

  const { openOnboarding } = useOnboardingNavigation();
  const { isCompaniesModalVisible } = useCompaniesModal();
  const { isContactsModalVisible } = useContactsModal();
  const { isSettingsModalVisible } = useSettingsModal();
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
      <CompaniesModal v-model:visible="isCompaniesModalVisible" />
      <ContactsModal v-model:visible="isContactsModalVisible" />
      <SettingsModal v-model:visible="isSettingsModalVisible" />
      <Toast />
    </NuxtLayout>
  </div>
</template>
