import { faker } from "@faker-js/faker";

export interface EventRow {
  id: string;
  application_id: string;
  contact_id: string | null;
  type: string;
  title: string;
  description: string;
  event_at: string;
  created_at: string;
  updated_at: string;
}

export function createEventRows(
  applicationIds: string[],
  contactIds: string[],
  eventsPerApplication = 2,
  seed = 1500,
): EventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applicationIds.flatMap((applicationId, applicationIndex) =>
    Array.from({ length: eventsPerApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);
      const createdAt = faker.date.recent({ days: 60 }).toISOString();

      return {
        id: faker.string.uuid(),
        application_id: applicationId,
        contact_id:
          contactIds.length > 0
            ? faker.helpers.arrayElement(contactIds)
            : null,
        type: faker.helpers.arrayElement(["note", "interview", "email", "status-change"]),
        title: faker.lorem.words({ min: 2, max: 5 }),
        description: faker.lorem.sentence(),
        event_at: faker.date.recent({ days: 45 }).toISOString(),
        created_at: createdAt,
        updated_at: createdAt,
      };
    }),
  );
}
