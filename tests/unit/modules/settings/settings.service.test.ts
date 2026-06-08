/**
 * Settings service tests.
 *
 * Tests for class-based settings service integration with persistence helpers.
 */

import type { ISettingRepository } from "@modules/settings";

import { SettingService } from "@modules/settings";
import {
  addRecentSearch,
  clearRecentSearches,
  getSettings,
  getThemeSettings,
  setOnboardingCompleted,
  setSetting,
  setSettings,
  setThemeSettings,
} from "@modules/settings/repositories/SettingRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildSettingsDto } from "../../../fixtures/factories/testPayloadFactories";

// Mock the settings repository
vi.mock("@modules/settings/repositories/SettingRepository", () => ({
  addRecentSearch: vi.fn(),
  clearRecentSearches: vi.fn(),
  getSettings: vi.fn(),
  getThemeSettings: vi.fn(),
  getOnboardingCompleted: vi.fn(),
  setOnboardingCompleted: vi.fn(),
  setSetting: vi.fn(),
  setSettings: vi.fn(),
  setThemeSettings: vi.fn(),
  setUiPreferences: vi.fn(),
  setNotificationSettings: vi.fn(),
  getUiPreferences: vi.fn(),
  setTableColumnVisibility: vi.fn(),
  getTableColumnVisibility: vi.fn(),
  getNotificationSettings: vi.fn(),
  getDeveloperSettings: vi.fn(),
  setDeveloperSettings: vi.fn(),
}));

describe("SettingService", () => {
  const mockedGetSettings = vi.mocked(getSettings);
  const mockedSetSettings = vi.mocked(setSettings);
  const mockedSetSetting = vi.mocked(setSetting);
  const mockedGetThemeSettings = vi.mocked(getThemeSettings);
  const mockedSetThemeSettings = vi.mocked(setThemeSettings);
  const mockedAddRecentSearch = vi.mocked(addRecentSearch);
  const mockedClearRecentSearches = vi.mocked(clearRecentSearches);
  const mockedSetOnboardingCompleted = vi.mocked(setOnboardingCompleted);

  function createRepositoryMock(): ISettingRepository {
    return {
      create: vi.fn(),
      delete: vi.fn(),
      deleteConstantRow: vi.fn(),
      get: vi.fn(),
      getConstantRow: vi.fn(),
      list: vi.fn(),
      listConstantRows: vi.fn(),
      listPage: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      upsertConstantRow: vi.fn(),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch settings from repository", async () => {
    const mockSettings = buildSettingsDto();

    mockedGetSettings.mockResolvedValue(mockSettings);
    const service = new SettingService(createRepositoryMock());

    const result = await service.fetchSettings();

    expect(result).toEqual(mockSettings);
  });

  it("should update all settings", async () => {
    const service = new SettingService(createRepositoryMock());

    await service.updateSettings({ theme: "dark" });

    expect(mockedSetSettings).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("should update a single setting", async () => {
    const service = new SettingService(createRepositoryMock());

    await service.updateSetting("theme", "dark");

    expect(mockedSetSetting).toHaveBeenCalledWith("theme", "dark");
  });

  it("should expose theme sub-service", async () => {
    mockedGetThemeSettings.mockResolvedValue({ theme: "dark" });
    const service = new SettingService(createRepositoryMock());

    const theme = await service.themeService.get();
    await service.themeService.set({ theme: "light" });

    expect(theme).toEqual({ theme: "dark" });
    expect(mockedSetThemeSettings).toHaveBeenCalledWith({ theme: "light" });
  });

  it("should expose recent search helpers", async () => {
    const service = new SettingService(createRepositoryMock());

    await service.recentSearchService.add("nuxt");
    await service.recentSearchService.clear();

    expect(mockedAddRecentSearch).toHaveBeenCalledWith("nuxt");
    expect(mockedClearRecentSearches).toHaveBeenCalled();
  });

  it("should update onboarding completion", async () => {
    const service = new SettingService(createRepositoryMock());

    await service.setOnboardingCompleted(true);

    expect(mockedSetOnboardingCompleted).toHaveBeenCalledWith(true);
  });
});
