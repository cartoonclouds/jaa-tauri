import { faker } from "@faker-js/faker";

export interface TagRow {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TAGS = [
  "Vue",
  "Nuxt",
  "Remote",
  "High Priority",
  "Agency",
  "Red Flag",
  "Good Culture",
] as const;

export function createTagRows(seed = 1700): TagRow[] {
  return DEFAULT_TAGS.map((name, index) => {
    faker.seed(seed + index);
    const createdAt = faker.date.past().toISOString();

    return {
      id: faker.string.uuid(),
      name,
      color: faker.color.rgb({ prefix: "#" }),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
