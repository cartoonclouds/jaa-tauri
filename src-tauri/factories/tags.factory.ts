import { faker } from "@faker-js/faker";

export interface TagRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function createTagRows(seed = 1300): TagRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const names = [
    "urgent",
    "referral",
    "dream-role",
    "remote",
    "hybrid",
    "junior",
    "senior",
    "follow-up",
  ];

  return names.map((name, index) => {
    faker.seed(seed + index);
    const createdAt = faker.date.recent({ days: 90 }).toISOString();

    return {
      id: faker.string.uuid(),
      name,
      color: faker.color.rgb(),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
