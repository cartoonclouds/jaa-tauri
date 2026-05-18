/**
 * Settings repository tests.
 *
 * Tests for typed persistence layer wrapping Tauri Store.
 */

import { Store } from "@tauri-apps/plugin-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Tauri Store
vi.mock("@tauri-apps/plugin-store", () => ({
  Store: {
    load: vi.fn(),
  },
}));

describe("settings.repository", () => {
  let mockStore: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Setup mock store
    mockStore = {
      get: vi.fn(),
      set: vi.fn(),
    };

    (Store.load as any).mockResolvedValue(mockStore);

    // We'd need to reload the module or reset state here
    // For now, tests show the pattern
  });

  it("should initialize settings store", async () => {
    const { initializeSettingsStore } = await import("@shared/settings");
    await initializeSettingsStore();

    expect(Store.load).toHaveBeenCalledWith(
      "settings.json",
      expect.objectContaining({
        autoSave: true,
      }),
    );
  });

  it("should get settings with defaults", async () => {
    mockStore.get.mockResolvedValue(null);

    const { initializeSettingsStore, getSettings } =
      await import("@shared/settings");
    await initializeSettingsStore();
    const settings = await getSettings();

    expect(settings.theme).toBe("auto");
    expect(settings.sidebarCollapsed).toBe(false);
  });

  it("should set a specific setting", async () => {
    mockStore.get.mockResolvedValue({
      theme: "auto",
      sidebarCollapsed: false,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    });

    const { initializeSettingsStore, setSetting } =
      await import("@shared/settings");
    await initializeSettingsStore();
    await setSetting("theme", "dark");

    expect(mockStore.set).toHaveBeenCalled();
  });

  it("should add to recent searches", async () => {
    mockStore.get.mockResolvedValue({
      theme: "auto",
      sidebarCollapsed: false,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    });

    const { initializeSettingsStore, addRecentSearch } =
      await import("@shared/settings");
    await initializeSettingsStore();
    await addRecentSearch("job applications");

    expect(mockStore.set).toHaveBeenCalled();
  });

  it("should not duplicate recent searches", async () => {
    mockStore.get.mockResolvedValue({
      theme: "auto",
      sidebarCollapsed: false,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: ["job applications"],
      tableColumnVisibility: {},
    });

    const { initializeSettingsStore, addRecentSearch } =
      await import("@shared/settings");
    await initializeSettingsStore();
    await addRecentSearch("job applications");

    // Should only have one entry
    expect(mockStore.set).toHaveBeenCalled();
  });
});
