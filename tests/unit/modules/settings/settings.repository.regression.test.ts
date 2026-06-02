import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  QueryBindings,
  QueryResult,
} from "@/services/database/QueryBindings";

import {
  getOnboardingCompleted,
  initializeSettingsStore,
  setOnboardingCompleted,
} from "@modules/settings/persistence";
import { describe, expect, it } from "vitest";

type SettingsRow = Record<string, unknown>;

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
      this.settingsRow = {
        id: String(bindings[0] ?? "app-settings"),
        theme: String(bindings[1] ?? "auto"),
        locale: String(bindings[2] ?? "en-GB"),
        notifications_enabled: Number(bindings[3] ?? 1),
        developer_mode: Number(bindings[4] ?? 0),
        recent_searches: String(bindings[5] ?? "[]"),
        table_column_visibility: String(bindings[6] ?? "{}"),
        onboarding_completed: Number(bindings[7] ?? 0),
        profile_id: null,
      };
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
