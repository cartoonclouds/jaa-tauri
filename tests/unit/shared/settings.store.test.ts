/**
 * Settings store tests.
 *
 * Tests for Pinia store integration with Tauri Store persistence.
 */

import { useSettingsStore } from "@shared/settings";
import {
  getSettings,
  initializeSettingsStore,
  setThemeSettings,
  setUiPreferences,
} from "@shared/settings/settings.repository";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the settings repository
vi.mock("@shared/settings/settings.repository", () => ({
  initializeSettingsStore: vi.fn(),
  getSettings: vi.fn(),
  setThemeSettings: vi.fn(),
  setUiPreferences: vi.fn(),
  setNotificationSettings: vi.fn(),
}));

describe("useSettingsStore", () => {
  const mockedGetSettings = vi.mocked(getSettings);
  const mockedInitializeSettingsStore = vi.mocked(initializeSettingsStore);
  const mockedSetThemeSettings = vi.mocked(setThemeSettings);
  const mockedSetUiPreferences = vi.mocked(setUiPreferences);

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize with default values", async () => {
    const store = useSettingsStore();

    expect(store.settings).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it("should load settings on initialize", async () => {
    const mockSettings = {
      theme: "light" as const,
      sidebarCollapsed: false,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    };

    mockedGetSettings.mockResolvedValue(mockSettings);
    const store = useSettingsStore();

    await store.initialize();

    expect(store.settings).toEqual(mockSettings);
    expect(store.isLoading).toBe(false);
  });

  it("should provide computed properties for quick access", async () => {
    const mockSettings = {
      theme: "dark" as const,
      sidebarCollapsed: true,
      notificationsEnabled: false,
      developerMode: true,
      recentSearches: [],
      tableColumnVisibility: {},
    };

    mockedGetSettings.mockResolvedValue(mockSettings);
    const store = useSettingsStore();

    await store.initialize();

    expect(store.theme).toBe("dark");
    expect(store.sidebarCollapsed).toBe(true);
    expect(store.notificationsEnabled).toBe(false);
    expect(store.developerMode).toBe(true);
  });

  it("should update theme", async () => {
    const mockSettings = {
      theme: "auto" as const,
      sidebarCollapsed: false,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    };

    mockedGetSettings.mockResolvedValue(mockSettings);
    mockedSetThemeSettings.mockResolvedValue(undefined);
    const store = useSettingsStore();

    await store.initialize();
    await store.updateTheme("dark");

    expect(setThemeSettings).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("should toggle sidebar", async () => {
    const mockSettings = {
      theme: "auto" as const,
      sidebarCollapsed: false,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    };

    mockedGetSettings.mockResolvedValue(mockSettings);
    mockedSetUiPreferences.mockResolvedValue(undefined);
    const store = useSettingsStore();

    await store.initialize();
    await store.toggleSidebar();

    expect(setUiPreferences).toHaveBeenCalledWith({
      sidebarCollapsed: true,
      tableColumnVisibility: {},
    });
  });

  it("should handle initialization errors", async () => {
    const error = new Error("Store initialization failed");
    mockedInitializeSettingsStore.mockRejectedValue(error);
    const store = useSettingsStore();

    await store.initialize();

    expect(store.error).toBe(error.message);
    expect(store.settings).toBeNull();
  });
});
