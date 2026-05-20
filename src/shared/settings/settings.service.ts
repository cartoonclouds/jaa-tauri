/**
 * Settings service.
 *
 * High-level API for managing application settings.
 * Wraps settings.repository with business logic.
 */

import type { AppSettings } from "./types";

import {
  addRecentSearch,
  clearRecentSearches,
  getDeveloperSettings,
  getNotificationSettings,
  getOnboardingCompleted,
  getSettings,
  getTableColumnVisibility,
  getThemeSettings,
  getUiPreferences,
  setDeveloperSettings,
  setNotificationSettings,
  setOnboardingCompleted,
  setSetting,
  setSettings,
  setTableColumnVisibility,
  setThemeSettings,
  setUiPreferences,
} from "./settings.repository";

/**
 * Settings service for managing app preferences.
 */
export const useSettingsService = () => {
  /**
   * Get all settings.
   */
  const fetchSettings = async (): Promise<AppSettings> => {
    return await getSettings();
  };

  /**
   * Update multiple settings at once.
   */
  const updateSettings = async (
    updates: Partial<AppSettings>,
  ): Promise<void> => {
    await setSettings(updates);
  };

  /**
   * Update a single setting.
   */
  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> => {
    await setSetting(key, value);
  };

  /**
   * Theme management.
   */
  const themeService = {
    get: getThemeSettings,
    set: setThemeSettings,
  };

  /**
   * UI preferences management.
   */
  const uiService = {
    get: getUiPreferences,
    set: setUiPreferences,
    setTableColumnVisibility,
    getTableColumnVisibility,
  };

  /**
   * Notification preferences management.
   */
  const notificationService = {
    get: getNotificationSettings,
    set: setNotificationSettings,
  };

  /**
   * Developer settings management.
   */
  const developerService = {
    get: getDeveloperSettings,
    set: setDeveloperSettings,
  };

  /**
   * Recent searches management.
   */
  const recentSearchService = {
    add: addRecentSearch,
    clear: clearRecentSearches,
  };

  return {
    fetchSettings,
    updateSettings,
    updateSetting,
    themeService,
    uiService,
    notificationService,
    developerService,
    recentSearchService,
    getOnboardingCompleted,
    setOnboardingCompleted,
  };
};

export type SettingsService = ReturnType<typeof useSettingsService>;
