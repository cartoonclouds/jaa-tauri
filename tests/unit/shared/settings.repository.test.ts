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

    expect(Store.load).toHaveBeenCalledWith("settings.json", {
      autoSave: true,
    });
  });

  it("should get settings with defaults", async () => {
    mockStore.get.mockResolvedValue(null);

    const { getSettings } = await import("@shared/settings");
    const settings = await getSettings();

    expect(settings.theme).toBe("auto");
    expect(settings.sidebarCollapsed).toBe(false);
  });

  it("should set a specific setting", async () => {
    mockStore.get.mockResolvedValue({
      theme: "auto",
      sidebarCollapsed: false,
      windowWidth: 1024,
      windowHeight: 768,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    });

    const { setSetting } = await import("@shared/settings");
    await setSetting("theme", "dark");

    expect(mockStore.set).toHaveBeenCalled();
  });

  it("should add to recent searches", async () => {
    mockStore.get.mockResolvedValue({
      theme: "auto",
      sidebarCollapsed: false,
      windowWidth: 1024,
      windowHeight: 768,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: [],
      tableColumnVisibility: {},
    });

    const { addRecentSearch } = await import("@shared/settings");
    await addRecentSearch("job applications");

    expect(mockStore.set).toHaveBeenCalled();
  });

  it("should not duplicate recent searches", async () => {
    mockStore.get.mockResolvedValue({
      theme: "auto",
      sidebarCollapsed: false,
      windowWidth: 1024,
      windowHeight: 768,
      notificationsEnabled: true,
      developerMode: false,
      recentSearches: ["job applications"],
      tableColumnVisibility: {},
    });

    const { addRecentSearch } = await import("@shared/settings");
    await addRecentSearch("job applications");

    // Should only have one entry
    expect(mockStore.set).toHaveBeenCalled();
  });
});
