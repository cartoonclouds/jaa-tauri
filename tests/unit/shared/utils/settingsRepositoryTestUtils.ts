import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  QueryBindings,
  QueryResult,
} from "@/services/database/QueryBindings";

type SettingsRow = Record<string, unknown>;

/**
 * In-memory settings DB double used by settings repository tests.
 */
export class MockSettingsDatabaseDriver implements DatabaseDriver {
  readonly name = "mock-db";

  private settingsRow: SettingsRow | null = null;
  private profileRow: SettingsRow | null = null;

  select<T = unknown>(sql: string): Promise<T[]> {
    if (sql.includes("FROM settings")) {
      if (!this.settingsRow) {
        return Promise.resolve([]);
      }

      return Promise.resolve([
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
      ]);
    }

    if (sql.includes("FROM profiles")) {
      if (!this.profileRow) {
        return Promise.resolve([]);
      }

      return Promise.resolve([this.profileRow as T]);
    }

    return Promise.resolve([]);
  }

  execute(sql: string, bindings: QueryBindings = []): Promise<QueryResult> {
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
