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
 * Settings service class for managing app preferences.
 */
export class SettingsService {
  /**
   * Get all settings.
   */
  async fetchSettings(): Promise<AppSettings> {
    return await getSettings();
  }

  /**
   * Update multiple settings at once.
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    await setSettings(updates);
  }

  /**
   * Update a single setting.
   */
  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> {
    await setSetting(key, value);
  }

  /**
   * Theme management.
   */
  readonly themeService = {
    get: getThemeSettings,
    set: setThemeSettings,
  };

  /**
   * UI preferences management.
   */
  readonly uiService = {
    get: getUiPreferences,
    set: setUiPreferences,
    setTableColumnVisibility,
    getTableColumnVisibility,
  };

  /**
   * Notification preferences management.
   */
  readonly notificationService = {
    get: getNotificationSettings,
    set: setNotificationSettings,
  };

  /**
   * Developer settings management.
   */
  readonly developerService = {
    get: getDeveloperSettings,
    set: setDeveloperSettings,
  };

  /**
   * Recent searches management.
   */
  readonly recentSearchService = {
    add: addRecentSearch,
    clear: clearRecentSearches,
  };

  async getOnboardingCompleted(): Promise<boolean> {
    return await getOnboardingCompleted();
  }

  async setOnboardingCompleted(value: boolean): Promise<void> {
    await setOnboardingCompleted(value);
  }
}

let settingsServiceInstance: SettingsService | null = null;

export function useSettingsService(): SettingsService {
  settingsServiceInstance ??= new SettingsService();

  return settingsServiceInstance;
}
