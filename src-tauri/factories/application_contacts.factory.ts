import { faker } from "@faker-js/faker";

export interface ApplicationContactRow {
  application_id: string;
  contact_id: string;
  relation_type: string;
  created_at: string;
}

export function createApplicationContactRows(
  applicationIds: string[],
  contactIds: string[],
  contactsPerApplication = 1,
  seed = 2100,
): ApplicationContactRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applicationIds.flatMap((applicationId, applicationIndex) =>
    Array.from({ length: contactsPerApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);

      return {
        application_id: applicationId,
        contact_id: contactIds[(applicationIndex + index) % contactIds.length],
        relation_type: faker.helpers.arrayElement(["owner", "recruiter", "interviewer"]),
        created_at: faker.date.recent({ days: 30 }).toISOString(),
      };
    }),
  );
}
