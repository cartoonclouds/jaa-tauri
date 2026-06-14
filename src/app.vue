<script setup lang="ts">
  import { logError, logInfo } from "@infra/logging/tauriLog.client";
  import ApplicationComponent from "@modules/applications/presentation/components/Application.vue";
  import CompaniesDialog from "@modules/companies/presentation/components/dialogs/CompaniesDialog.vue";
  import ContactsDialog from "@modules/contacts/presentation/components/dialogs/ContactsDialog.vue";
  import { useProfile } from "@modules/profile";
  import { useGlobalSearchDialog } from "@modules/search";
  import GlobalSearchDialog from "@modules/search/presentation/components/dialogs/GlobalSearchDialog.vue";
  import {
    getOnboardingCompleted,
    setOnboardingCompleted,
  } from "@modules/settings";
  import SettingsDialog from "@modules/settings/presentation/components/dialogs/SettingsDialog.vue";
  import { invoke, isTauri } from "@tauri-apps/api/core";
  import { nextTick, onMounted, ref, watch } from "vue";

  import { NuxtLayout, NuxtPage, Toast } from "#components";
  import { useApplicationsDrawer } from "@/composables/useApplicationsDrawer";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
  import { useContactsDialog } from "@/composables/useContactsDialog";
  import { useOnboardingNavigation } from "@/composables/useOnboardingNavigation.client";
  import { useSettingsDialog } from "@/composables/useSettingsDialog";

  const { openOnboarding } = useOnboardingNavigation();
  const {
    isApplicationDrawerVisible,
    closeApplicationDrawer,
    consumePendingApplicationId,
  } = useApplicationsDrawer();
  const { isCompaniesDialogVisible, consumePendingCompanyId } =
    useCompaniesDialog();
  const { isContactsDialogVisible, consumePendingContactId } =
    useContactsDialog();
  const { isGlobalSearchDialogVisible } = useGlobalSearchDialog();
  const { isSettingsDialogVisible } = useSettingsDialog();
  const { service: profileService } = useProfile();
  const initialApplicationId = ref<string | null>(null);
  const initialCompanyId = ref<string | null>(null);
  const initialContactId = ref<string | null>(null);
  const isAppReady = ref(false);

  watch(
    isApplicationDrawerVisible,
    (visible) => {
      if (!visible) {
        initialApplicationId.value = null;
        return;
      }

      initialApplicationId.value = consumePendingApplicationId();
    },
    { immediate: true },
  );

  watch(
    isCompaniesDialogVisible,
    (visible) => {
      if (!visible) {
        initialCompanyId.value = null;
        return;
      }

      initialCompanyId.value = consumePendingCompanyId();
    },
    { immediate: true },
  );

  watch(
    isContactsDialogVisible,
    (visible) => {
      if (!visible) {
        initialContactId.value = null;
        return;
      }

      initialContactId.value = consumePendingContactId();
    },
    { immediate: true },
  );

  onMounted(async () => {
    const shouldManageSplashscreen = import.meta.client && isTauri();

    if (shouldManageSplashscreen) {
      try {
        await invoke("hide_main_window");
      } catch (error) {
        logError("Failed to hide main window during startup:", error);
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
    } finally {
      isAppReady.value = true;
      await nextTick();

      if (shouldManageSplashscreen) {
        try {
          await invoke("close_splashscreen");
        } catch (error) {
          logError("Failed to close splashscreen:", error);
        }
      }
    }
  });
</script>

<template>
  <div v-show="isAppReady" class="app-dark min-h-screen">
    <NuxtLayout>
      <NuxtPage />

      <ApplicationComponent
        v-if="isApplicationDrawerVisible"
        :initial-application-id="initialApplicationId"
        :drawer-only="true"
        @request-close="closeApplicationDrawer"
      />

      <CompaniesDialog
        v-model:visible="isCompaniesDialogVisible"
        :initial-company-id="initialCompanyId"
      />

      <ContactsDialog
        v-model:visible="isContactsDialogVisible"
        :initial-contact-id="initialContactId"
      />

      <SettingsDialog v-model:visible="isSettingsDialogVisible" />

      <GlobalSearchDialog v-model:visible="isGlobalSearchDialogVisible" />

      <Toast />
    </NuxtLayout>
  </div>
</template>
