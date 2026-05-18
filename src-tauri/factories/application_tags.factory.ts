import { faker } from "@faker-js/faker";

export interface ApplicationTagRow {
  application_id: string;
  tag_id: string;
  created_at: string;
}

export function createApplicationTagRows(
  applicationIds: string[],
  tagIds: string[],
  linksPerApplication = 2,
  seed = 1800,
): ApplicationTagRow[] {
  const rows: ApplicationTagRow[] = [];

  applicationIds.forEach((applicationId, appIndex) => {
    for (let i = 0; i < linksPerApplication; i += 1) {
      const index = appIndex * linksPerApplication + i;
      faker.seed(seed + index);

      rows.push({
        application_id: applicationId,
        tag_id: tagIds[index % tagIds.length] ?? tagIds[0],
        created_at: faker.date.recent({ days: 15 }).toISOString(),
      });
    }
  });

  return rows;
}
