import type { AppSettings, StatsVisibilityMap } from "../types";
import type {
  ConstantEntryUpsertPayload,
  ISettingRepository,
  ListConstantRowsOptions,
  SettingUpsertPayload,
} from "../types";
import type { PersistedConstantSourceType } from "@shared/constants/persistedConstants";
import type { DatatablePageQuery } from "@shared/types";

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
} from "@modules/settings/repositories/SettingRepository";

/**
 * Application service facade for reading and mutating settings domain data.
 */
export class SettingService {
  constructor(private readonly repository: ISettingRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  upsert(payload: SettingUpsertPayload) {
    return this.repository.upsert(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  listConstantRows(
    type: PersistedConstantSourceType,
    options?: ListConstantRowsOptions,
  ) {
    return this.repository.listConstantRows(type, options);
  }

  upsertConstantRow(payload: ConstantEntryUpsertPayload) {
    return this.repository.upsertConstantRow(payload);
  }

  deleteConstantRow(type: PersistedConstantSourceType, value: string) {
    return this.repository.deleteConstantRow(type, value);
  }
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
    async getStatsVisibility(): Promise<StatsVisibilityMap> {
      const prefs: { statsVisibility: StatsVisibilityMap } =
        await getUiPreferences();
      return prefs.statsVisibility;
    },
    async setStatsVisibility(value: StatsVisibilityMap): Promise<void> {
      await setSetting("statsVisibility", value);
    },
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

  /** Returns whether onboarding has already been completed. */
  async getOnboardingCompleted(): Promise<boolean> {
    return await getOnboardingCompleted();
  }

  /** Persists onboarding completion state. */
  async setOnboardingCompleted(value: boolean): Promise<void> {
    await setOnboardingCompleted(value);
  }
}
