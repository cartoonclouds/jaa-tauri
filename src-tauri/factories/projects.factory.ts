import { faker } from "@faker-js/faker";

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function createProjectRow(index: number, seed = 1100): ProjectRow {
  faker.seed(seed + index);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const createdAt = faker.date.past().toISOString();

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    description:
      faker.helpers.maybe(() => faker.lorem.sentence(), {
        probability: 0.8,
      }) ?? null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createProjectRows(count: number, seed = 1100): ProjectRow[] {
  return Array.from({ length: count }, (_, index) =>
    createProjectRow(index, seed),
  );
}
