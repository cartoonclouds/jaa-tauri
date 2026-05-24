import { faker } from "@faker-js/faker";

export interface ContactTagRow {
  contact_id: string;
  tag_id: string;
  created_at: string;
}

export function createContactTagRows(
  contactIds: string[],
  tagIds: string[],
  tagsPerContact = 1,
  seed = 2100,
): ContactTagRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return contactIds.flatMap((contactId, contactIndex) =>
    Array.from({ length: tagsPerContact }, (_, index) => {
      faker.seed(seed + contactIndex * 100 + index);

      return {
        contact_id: contactId,
        tag_id: tagIds[(contactIndex + index) % tagIds.length],
        created_at: faker.date.recent({ days: 30 }).toISOString(),
      };
    }),
  );
}
