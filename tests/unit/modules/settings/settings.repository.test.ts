/**
 * Settings repository tests.
 *
 * Tests for typed persistence layer wrapping the database driver.
 */

import {
  getSettings,
  initializeSettingsStore,
  setSettings,
} from "@modules/settings/persistence";
import { MockSettingsDatabaseDriver } from "@testUtils/settingsRepositoryTestUtils";
import { describe, expect, it } from "vitest";

describe("settings.repository", () => {
  it("initializes and returns default settings", async () => {
    const db = new MockSettingsDatabaseDriver();

    await initializeSettingsStore(db);
    const settings = await getSettings();

    expect(settings.theme).toBe("auto");
    expect(settings.onboardingCompleted).toBe(false);
  });

  it("persists settings updates without profile data", async () => {
    const db = new MockSettingsDatabaseDriver();

    await initializeSettingsStore(db);
    await setSettings({
      theme: "dark",
      onboardingCompleted: true,
    });

    const settings = await getSettings();

    expect(settings.theme).toBe("dark");
    expect(settings.onboardingCompleted).toBe(true);
  });
});
