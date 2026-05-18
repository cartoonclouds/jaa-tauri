/**
 * Settings store tests.
 *
 * Tests for Pinia store integration with Tauri Store persistence.
 */

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
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize with default values", async () => {
    const { useSettingsStore } = await import("@shared/settings");
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

    const { getSettings } =
      await import("@shared/settings/settings.repository");
    (getSettings as any).mockResolvedValue(mockSettings);

    const { useSettingsStore } = await import("@shared/settings");
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

    const { getSettings } =
      await import("@shared/settings/settings.repository");
    (getSettings as any).mockResolvedValue(mockSettings);

    const { useSettingsStore } = await import("@shared/settings");
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

    const { getSettings, setThemeSettings } =
      await import("@shared/settings/settings.repository");
    (getSettings as any).mockResolvedValue(mockSettings);
    (setThemeSettings as any).mockResolvedValue(undefined);

    const { useSettingsStore } = await import("@shared/settings");
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

    const { getSettings, setUiPreferences } =
      await import("@shared/settings/settings.repository");
    (getSettings as any).mockResolvedValue(mockSettings);
    (setUiPreferences as any).mockResolvedValue(undefined);

    const { useSettingsStore } = await import("@shared/settings");
    const store = useSettingsStore();

    await store.initialize();
    await store.toggleSidebar();

    expect(setUiPreferences).toHaveBeenCalledWith({
      sidebarCollapsed: true,
      tableColumnVisibility: {},
    });
  });

  it("should handle initialization errors", async () => {
    const { initializeSettingsStore } =
      await import("@shared/settings/settings.repository");
    const error = new Error("Store initialization failed");
    (initializeSettingsStore as any).mockRejectedValue(error);

    const { useSettingsStore } = await import("@shared/settings");
    const store = useSettingsStore();

    await store.initialize();

    expect(store.error).toBe(error.message);
    expect(store.settings).toBeNull();
  });
});
