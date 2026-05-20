/**
 * Settings repository tests.
 *
 * Tests for typed persistence layer wrapping the database driver.
 */

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
  private profileRow: SettingsRow | null = null;

  async select<T = unknown>(sql: string): Promise<T[]> {
    if (sql.includes("FROM settings")) {
      if (!this.settingsRow) {
        return [];
      }

      return [
        {
          ...this.settingsRow,
          ...(this.profileRow ?? {}),
          profile_id:
            this.settingsRow.profile_id ?? this.profileRow?.id ?? null,
          profile_full_name: this.profileRow?.full_name ?? null,
          profile_email: this.profileRow?.email ?? null,
          profile_desired_salary: this.profileRow?.desired_salary ?? null,
          profile_salary_currency: this.profileRow?.salary_currency ?? null,
          profile_preferred_locations:
            this.profileRow?.preferred_locations ?? null,
          profile_remote_preference: this.profileRow?.remote_preference ?? null,
          profile_skills: this.profileRow?.skills ?? null,
          profile_linkedin_url: this.profileRow?.linkedin_url ?? null,
          profile_github_url: this.profileRow?.github_url ?? null,
          profile_portfolio_url: this.profileRow?.portfolio_url ?? null,
          profile_headline: this.profileRow?.headline ?? null,
          profile_work_eligibility: this.profileRow?.work_eligibility ?? null,
          profile_notice_period_days:
            this.profileRow?.notice_period_days ?? null,
          profile_interview_availability:
            this.profileRow?.interview_availability ?? null,
          profile_location_text: this.profileRow?.location_text ?? null,
        } as T,
      ];
    }

    if (sql.includes("FROM profiles")) {
      if (!this.profileRow) {
        return [];
      }

      return [this.profileRow as T];
    }

    return [];
  }

  async execute(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    if (sql.includes("INSERT INTO profiles")) {
      this.profileRow = {
        id: String(bindings[0] ?? "profile-1"),
        full_name: String(bindings[1] ?? ""),
        email: bindings[2] ?? null,
        phone: bindings[3] ?? null,
        linkedin_url: bindings[4] ?? null,
        github_url: bindings[5] ?? null,
        portfolio_url: bindings[6] ?? null,
        headline: bindings[7] ?? null,
        summary: bindings[8] ?? null,
        location_text: bindings[9] ?? null,
        desired_salary: bindings[10] ?? null,
        salary_currency: bindings[11] ?? "USD",
        preferred_locations: bindings[12] ?? "[]",
        remote_preference: bindings[13] ?? "flexible",
        skills: bindings[14] ?? "[]",
        work_eligibility: bindings[15] ?? "",
        notice_period_days: bindings[16] ?? null,
        interview_availability: bindings[17] ?? "",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      };
    }

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

describe("settings.repository", () => {
  it("initializes and returns default settings", async () => {
    vi.resetModules();

    const { initializeSettingsStore, getSettings } =
      await import("@shared/settings");
    const db = new MockDatabaseDriver();

    await initializeSettingsStore(db);
    const settings = await getSettings();

    expect(settings.theme).toBe("auto");
    expect(settings.sidebarCollapsed).toBe(false);
    expect(settings.userProfile.fullName).toBe("");
  });

  it("persists settings updates and profile references", async () => {
    vi.resetModules();

    const { initializeSettingsStore, setSettings, getSettings } =
      await import("@shared/settings");
    const db = new MockDatabaseDriver();

    await initializeSettingsStore(db);
    await setSettings({
      theme: "dark",
      userProfile: {
        fullName: "Jane Doe",
        email: "jane@example.com",
        targetRole: "Frontend Engineer",
        desiredSalary: 120000,
        salaryCurrency: "USD",
        preferredLocations: ["Berlin"],
        remotePreference: "flexible",
        skills: ["Vue", "TypeScript"],
        linkedInUrl: "https://linkedin.com/in/janedoe",
        githubUrl: "https://github.com/janedoe",
        workEligibility: "EU",
        noticePeriodDays: 30,
        interviewAvailability: "Weekdays",
      },
    });

    const settings = await getSettings();

    expect(settings.theme).toBe("dark");
    expect(settings.userProfile.fullName).toBe("Jane Doe");
    expect(settings.userProfile.githubUrl).toBe("https://github.com/janedoe");
  });
});
