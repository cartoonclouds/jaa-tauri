import { faker } from "@faker-js/faker";

export interface SettingRow {
  id: string;
  theme: string;
  locale: string;
  notifications_enabled: number;
  developer_mode: number;
  sidebar_collapsed: number;
  recent_searches: string;
  table_column_visibility: string;
  onboarding_completed: number;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export function createSettingRow(
  profileId: string | null,
  seed = 1700,
): SettingRow {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");
  const createdAt = faker.date.recent({ days: 30 }).toISOString();

  return {
    id: "app-settings",
    theme: faker.helpers.arrayElement(["system", "light", "dark"]),
    locale: faker.helpers.arrayElement(["en-GB", "en-US"]),
    notifications_enabled: 1,
    developer_mode: 0,
    sidebar_collapsed: 0,
    recent_searches: JSON.stringify(["frontend engineer", "tauri jobs"]),
    table_column_visibility: JSON.stringify({
      applications_status: true,
      applications_salary: true,
      documents_kind: true,
    }),
    onboarding_completed: profileId ? 1 : 0,
    profile_id: profileId,
    created_at: createdAt,
    updated_at: createdAt,
  };
}
