import { faker } from "@faker-js/faker";

export interface SettingRow {
  id: string;
  theme: string;
  locale: string;
  notifications_enabled: number;
  developer_mode: number;
  created_at: string;
  updated_at: string;
}

export function createSettingRow(seed = 1700): SettingRow {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");
  const createdAt = faker.date.recent({ days: 30 }).toISOString();

  return {
    id: "app",
    theme: faker.helpers.arrayElement(["system", "light", "dark"]),
    locale: faker.helpers.arrayElement(["en-GB", "en-US"]),
    notifications_enabled: 1,
    developer_mode: 0,
    created_at: createdAt,
    updated_at: createdAt,
  };
}
