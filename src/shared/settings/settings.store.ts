/**
 * Settings store (Pinia).
 *
 * Optional reactive store for UI bindings to app settings.
 * Persistence is handled by settings.repository (DatabaseDriver).
 * This store provides reactive state for Vue components.
 */

import type { AppSettings } from "./types";

import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
  getSettings,
  initializeSettingsStore,
  setNotificationSettings,
  setThemeSettings,
  setUiPreferences,
} from "./settings.repository";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<AppSettings | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Initialize settings from persistent store.
   */
  const initialize = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await initializeSettingsStore();
      settings.value = await getSettings();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to initialize settings";
      console.error("Settings initialization error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reload settings from store.
   */
  const reload = async (): Promise<void> => {
    try {
      settings.value = await getSettings();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to reload settings";
      console.error("Settings reload error:", err);
    }
  };

  /**
   * Update theme.
   */
  const updateTheme = async (
    theme: "light" | "dark" | "auto",
  ): Promise<void> => {
    try {
      await setThemeSettings({ theme });
      await reload();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update theme";
      console.error("Theme update error:", err);
    }
  };

  /**
   * Toggle sidebar.
   */
  const toggleSidebar = async (): Promise<void> => {
    if (!settings.value) return;

    try {
      await setUiPreferences({
        tableColumnVisibility: settings.value.tableColumnVisibility,
      });
      await reload();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to toggle sidebar";
      console.error("Sidebar toggle error:", err);
    }
  };

  /**
   * Toggle notifications.
   */
  const toggleNotifications = async (): Promise<void> => {
    if (!settings.value) return;

    try {
      await setNotificationSettings({
        notificationsEnabled: !settings.value.notificationsEnabled,
      });
      await reload();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to toggle notifications";
      console.error("Notifications toggle error:", err);
    }
  };

  // Computed properties for easy access in templates
  const theme = computed(() => settings.value?.theme ?? "auto");
  const notificationsEnabled = computed(
    () => settings.value?.notificationsEnabled ?? true,
  );
  const developerMode = computed(() => settings.value?.developerMode ?? false);

  return {
    settings,
    isLoading,
    error,
    initialize,
    reload,
    updateTheme,
    toggleSidebar,
    toggleNotifications,
    theme,
    notificationsEnabled,
    developerMode,
  };
});
