import {
  getOnboardingCompleted,
  initializeSettingsStore,
  setOnboardingCompleted,
} from "@modules/settings/persistence";
import { MockSettingsDatabaseDriver } from "@testUtils/settingsRepositoryTestUtils";
import { describe, expect, it } from "vitest";

describe("settings.repository regression", () => {
  it("does not leak onboarding completion into new databases", async () => {
    const firstDb = new MockSettingsDatabaseDriver();
    await initializeSettingsStore(firstDb);

    expect(await getOnboardingCompleted()).toBe(false);

    await setOnboardingCompleted(true);
    expect(await getOnboardingCompleted()).toBe(true);

    const secondDb = new MockSettingsDatabaseDriver();
    await initializeSettingsStore(secondDb);

    expect(await getOnboardingCompleted()).toBe(false);
  });
});
