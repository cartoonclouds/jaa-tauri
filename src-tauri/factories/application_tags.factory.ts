import { faker } from "@faker-js/faker";

export interface ApplicationTagRow {
  application_id: string;
  tag_id: string;
  created_at: string;
}

export function createApplicationTagRows(
  applicationIds: string[],
  tagIds: string[],
  tagsPerApplication = 2,
  seed = 1900,
): ApplicationTagRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applicationIds.flatMap((applicationId, applicationIndex) =>
    Array.from({ length: tagsPerApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);

      return {
        application_id: applicationId,
        tag_id: tagIds[(applicationIndex + index) % tagIds.length],
        created_at: faker.date.recent({ days: 30 }).toISOString(),
      };
    }),
  );
}
