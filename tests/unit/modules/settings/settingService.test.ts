import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@modules/settings/repositories/SettingRepository", () => ({
  addRecentSearch: vi.fn(),
  clearRecentSearches: vi.fn(),
  getDeveloperSettings: vi.fn(),
  getNotificationSettings: vi.fn(),
  getOnboardingCompleted: vi.fn(),
  getSettings: vi.fn(),
  getTableColumnVisibility: vi.fn(),
  getThemeSettings: vi.fn(),
  getUiPreferences: vi.fn(),
  setDeveloperSettings: vi.fn(),
  setNotificationSettings: vi.fn(),
  setOnboardingCompleted: vi.fn(),
  setSetting: vi.fn(),
  setSettings: vi.fn(),
  setTableColumnVisibility: vi.fn(),
  setThemeSettings: vi.fn(),
  setUiPreferences: vi.fn(),
}));

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
import { SettingService } from "@modules/settings/services/SettingService";

import {
  buildSettingsDto,
  buildSettingUpsertPayload,
} from "../../../fixtures/factories/testPayloadFactories";
import { createSettingRepositoryMock } from "../../../fixtures/factories/testRepositoryFactories";

describe("setting service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates repository-backed settings operations", async () => {
    const { repository } = createSettingRepositoryMock();
    const service = new SettingService(repository);
    const pageQuery = { page: 1, rows: 10, search: "theme" };
    const payload = buildSettingUpsertPayload({ theme: "dark" });

    await service.list();
    await service.listPage(pageQuery);
    await service.upsert(payload);
    await service.delete("settings");
    await service.listConstantRows("applicationStatus", {
      includeHidden: true,
    });
    await service.upsertConstantRow({
      type: "applicationStatus",
      value: "saved",
      label: "Saved",
    });
    await service.deleteConstantRow("applicationStatus", "saved");

    expect(repository.list).toHaveBeenCalledOnce();
    expect(repository.listPage).toHaveBeenCalledWith(pageQuery);
    expect(repository.upsert).toHaveBeenCalledWith(payload);
    expect(repository.delete).toHaveBeenCalledWith("settings");
    expect(repository.listConstantRows).toHaveBeenCalledWith(
      "applicationStatus",
      { includeHidden: true },
    );
    expect(repository.upsertConstantRow).toHaveBeenCalledWith({
      type: "applicationStatus",
      value: "saved",
      label: "Saved",
    });
    expect(repository.deleteConstantRow).toHaveBeenCalledWith(
      "applicationStatus",
      "saved",
    );
  });

  it("delegates preference helpers and nested service facades", async () => {
    const { repository } = createSettingRepositoryMock();
    const service = new SettingService(repository);
    const settings = buildSettingsDto({
      theme: "dark",
      developerMode: true,
      statsVisibility: { total: true },
    });

    vi.mocked(getSettings).mockResolvedValue(settings);
    vi.mocked(getThemeSettings).mockResolvedValue({ theme: "light" });
    vi.mocked(getUiPreferences).mockResolvedValue({
      tableColumnVisibility: { company: true },
      statsVisibility: { total: true },
    });
    vi.mocked(getTableColumnVisibility).mockResolvedValue({ company: true });
    vi.mocked(getNotificationSettings).mockResolvedValue({
      notificationsEnabled: true,
    });
    vi.mocked(getDeveloperSettings).mockResolvedValue({ developerMode: true });
    vi.mocked(getOnboardingCompleted).mockResolvedValue(true);

    await expect(service.fetchSettings()).resolves.toEqual(settings);
    await service.updateSettings({ theme: "light" });
    await service.updateSetting("theme", "dark");
    await expect(service.themeService.get()).resolves.toEqual({
      theme: "light",
    });
    await service.themeService.set({ theme: "dark" });
    await expect(service.uiService.get()).resolves.toEqual({
      tableColumnVisibility: { company: true },
      statsVisibility: { total: true },
    });
    await service.uiService.set({
      tableColumnVisibility: { company: false },
      statsVisibility: { total: false },
    });
    await service.uiService.setTableColumnVisibility("companies", {
      name: true,
    });
    await expect(
      service.uiService.getTableColumnVisibility("companies"),
    ).resolves.toEqual({ company: true });
    await expect(service.uiService.getStatsVisibility()).resolves.toEqual({
      total: true,
    });
    await service.uiService.setStatsVisibility({ total: false });
    await expect(service.notificationService.get()).resolves.toEqual({
      notificationsEnabled: true,
    });
    await service.notificationService.set({ notificationsEnabled: false });
    await expect(service.developerService.get()).resolves.toEqual({
      developerMode: true,
    });
    await service.developerService.set({ developerMode: false });
    await service.recentSearchService.add("nuxt");
    await service.recentSearchService.clear();
    await expect(service.getOnboardingCompleted()).resolves.toBe(true);
    await service.setOnboardingCompleted(false);

    expect(setSettings).toHaveBeenCalledWith({ theme: "light" });
    expect(setSetting).toHaveBeenCalledWith("theme", "dark");
    expect(setThemeSettings).toHaveBeenCalledWith({ theme: "dark" });
    expect(setUiPreferences).toHaveBeenCalledWith({
      tableColumnVisibility: { company: false },
      statsVisibility: { total: false },
    });
    expect(setTableColumnVisibility).toHaveBeenCalledWith("companies", {
      name: true,
    });
    expect(setSetting).toHaveBeenCalledWith("statsVisibility", {
      total: false,
    });
    expect(setNotificationSettings).toHaveBeenCalledWith({
      notificationsEnabled: false,
    });
    expect(setDeveloperSettings).toHaveBeenCalledWith({ developerMode: false });
    expect(addRecentSearch).toHaveBeenCalledWith("nuxt");
    expect(clearRecentSearches).toHaveBeenCalledOnce();
    expect(setOnboardingCompleted).toHaveBeenCalledWith(false);
  });
});
