import { faker } from "@faker-js/faker";

export interface ApplicationContactRow {
  application_id: string;
  contact_id: string;
  relation_type: string;
  created_at: string;
}

interface ApplicationContactApplicationInput {
  id: string;
  company_id: string | null;
}

interface ApplicationContactInput {
  id: string;
  company_id: string | null;
}

export function createApplicationContactRows(
  applications: ApplicationContactApplicationInput[],
  contacts: ApplicationContactInput[],
  contactsPerApplication = 1,
  seed = 2100,
): ApplicationContactRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applications
    .flatMap((application, applicationIndex) =>
      Array.from({ length: contactsPerApplication }, (_, index) => {
        faker.seed(seed + applicationIndex * 100 + index);
        const companyContacts = contacts.filter(
          (contact) => contact.company_id === application.company_id,
        );
        const fallbackContacts = contacts;
        const selectedContact =
          companyContacts.length > 0
            ? faker.helpers.arrayElement(companyContacts)
            : fallbackContacts.length > 0
              ? faker.helpers.arrayElement(fallbackContacts)
              : null;

        if (!selectedContact) {
          return null;
        }

        return {
          application_id: application.id,
          contact_id: selectedContact.id,
          relation_type: faker.helpers.arrayElement([
            "owner",
            "recruiter",
            "interviewer",
          ]),
          created_at: faker.date.recent({ days: 30 }).toISOString(),
        };
      }),
    )
    .filter((row): row is ApplicationContactRow => row !== null);
}
