import { faker } from "@faker-js/faker";

import { createLondonLocationSeed } from "./location.factory";

export interface ContactRow {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  location_text: string;
  location_lat: number;
  location_lng: number;
  type: "company" | "recruiter";
  notes: string;
  created_at: string;
  updated_at: string;
}

export function createContactRows(
  companyIds: string[],
  contactsPerCompany = 2,
  seed = 1100,
): ContactRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return companyIds.flatMap((companyId, companyIndex) =>
    Array.from({ length: contactsPerCompany }, (_, index) => {
      faker.seed(seed + companyIndex * 100 + index);
      const createdAt = faker.date.recent({ days: 90 }).toISOString();
      const fullName = faker.person.fullName();
      const location = createLondonLocationSeed();

      return {
        id: faker.string.uuid(),
        company_id: companyId,
        full_name: fullName,
        email: faker.internet.email({ firstName: fullName.split(" ")[0] }),
        phone: faker.phone.number(),
        linkedin_url: `https://www.linkedin.com/in/${faker.helpers.slugify(fullName).toLowerCase()}`,
        location_text: location.locationText,
        location_lat: location.locationLat,
        location_lng: location.locationLng,
        type: faker.helpers.arrayElement(["company", "recruiter"]),
        notes: faker.person.jobTitle(),
        created_at: createdAt,
        updated_at: createdAt,
      };
    }),
  );
}
