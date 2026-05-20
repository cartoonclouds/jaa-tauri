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

interface EventApplicationInput {
  id: string;
  company_id: string;
}

interface EventContactInput {
  id: string;
  company_id: string;
}

export function createEventRows(
  applications: EventApplicationInput[],
  contacts: EventContactInput[],
  eventsPerApplication = 2,
  seed = 1500,
): EventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applications.flatMap((application, applicationIndex) =>
    Array.from({ length: eventsPerApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);
      const createdAt = faker.date.recent({ days: 60 }).toISOString();
      const companyContacts = contacts.filter(
        (contact) => contact.company_id === application.company_id,
      );
      const type = faker.helpers.arrayElement([
        "note",
        "interview",
        "email",
        "status-change",
      ]);

      return {
        id: faker.string.uuid(),
        application_id: application.id,
        contact_id:
          companyContacts.length > 0
            ? faker.helpers.arrayElement(companyContacts).id
            : null,
        type,
        title:
          type === "interview"
            ? faker.helpers.arrayElement([
                "Recruiter Screen",
                "Technical Interview",
                "Hiring Manager Interview",
              ])
            : faker.lorem.words({ min: 2, max: 5 }),
        description: faker.lorem.sentence(),
        event_at: faker.date.recent({ days: 45 }).toISOString(),
        created_at: createdAt,
        updated_at: createdAt,
      };
    }),
  );
}
