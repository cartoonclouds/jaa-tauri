import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  QueryBindings,
  QueryResult,
} from "@/services/database/QueryBindings";

import {
  getSettings,
  initializeSettingsStore,
  setSettings,
} from "@modules/settings/persistence";
import { describe, expect, it } from "vitest";

import { buildSettingsRow } from "../../../fixtures/factories/testPayloadFactories";

type SettingsRow = Record<string, unknown>;

/**
 * Settings repository tests.
 *
 * Tests for typed persistence layer wrapping the database driver.
 */
class MockSettingsDatabaseDriver implements DatabaseDriver {
  readonly name = "mock-db";

  private settingsRow: SettingsRow | null = null;

  select<T = unknown>(sql: string): Promise<T[]> {
    if (!sql.includes("FROM settings")) {
      return Promise.resolve([]);
    }

    if (!this.settingsRow) {
      return Promise.resolve([]);
    }

    return Promise.resolve([this.settingsRow as T]);
  }

  execute(sql: string, bindings: QueryBindings = []): Promise<QueryResult> {
    if (sql.includes("INSERT INTO settings")) {
      this.settingsRow = buildSettingsRow({
        id: String(bindings[0] ?? "app-settings"),
        theme: String(bindings[1] ?? "auto"),
        locale: String(bindings[2] ?? "en-GB"),
        notifications_enabled: Number(bindings[3] ?? 1),
        developer_mode: Number(bindings[4] ?? 0),
        recent_searches: String(bindings[5] ?? "[]"),
        table_column_visibility: String(bindings[6] ?? "{}"),
        stats_visibility: String(bindings[7] ?? "{}"),
        onboarding_completed: Number(bindings[8] ?? 0),
        profile_id: null,
      });
    }

    return Promise.resolve({
      rowsAffected: 1,
      lastInsertId: 0,
    });
  }

  async transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T> {
    return await callback(this);
  }
}

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
