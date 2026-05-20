import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  QueryBindings,
  QueryResult,
} from "@/services/database/QueryBindings";

import { describe, expect, it, vi } from "vitest";

type SettingsRow = Record<string, unknown>;

class MockDatabaseDriver implements DatabaseDriver {
  readonly name = "mock-db";

  private settingsRow: SettingsRow | null = null;

  async select<T = unknown>(sql: string): Promise<T[]> {
    if (!sql.includes("FROM settings")) {
      return [];
    }

    if (!this.settingsRow) {
      return [];
    }

    return [this.settingsRow as T];
  }

  async execute(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    if (sql.includes("INSERT INTO settings")) {
      this.settingsRow = {
        id: String(bindings[0] ?? "app-settings"),
        theme: String(bindings[1] ?? "auto"),
        locale: String(bindings[2] ?? "en-GB"),
        notifications_enabled: Number(bindings[3] ?? 1),
        developer_mode: Number(bindings[4] ?? 0),
        sidebar_collapsed: Number(bindings[5] ?? 0),
        recent_searches: String(bindings[6] ?? "[]"),
        table_column_visibility: String(bindings[7] ?? "{}"),
        onboarding_completed: Number(bindings[8] ?? 0),
        profile_id: bindings[9] ?? null,
        profile_full_name: null,
        profile_email: null,
        profile_linkedin_url: null,
        profile_headline: null,
        profile_location_text: null,
      };
    }

    return {
      rowsAffected: 1,
      lastInsertId: null,
    };
  }

  async transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T> {
    return await callback(this);
  }
}

describe("settings.repository regression", () => {
  it("does not leak onboarding completion into new databases", async () => {
    vi.resetModules();

    const settings = await import("@shared/settings");

    const firstDb = new MockDatabaseDriver();
    await settings.initializeSettingsStore(firstDb);

    expect(await settings.getOnboardingCompleted()).toBe(false);

    await settings.setOnboardingCompleted(true);
    expect(await settings.getOnboardingCompleted()).toBe(true);

    const secondDb = new MockDatabaseDriver();
    await settings.initializeSettingsStore(secondDb);

    expect(await settings.getOnboardingCompleted()).toBe(false);
  });
});
