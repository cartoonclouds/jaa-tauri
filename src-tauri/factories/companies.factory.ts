import { faker } from "@faker-js/faker";

import { createLondonLocationSeed } from "./location.factory";

export interface CompanyRow {
  id: string;
  name: string;
  website_url: string | null;
  linkedin_url: string | null;
  industry: string | null;
  size: string | null;
  location_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function createCompanyRows(count: number, seed = 1000): CompanyRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return Array.from({ length: count }, () => {
    const createdAt = faker.date.recent({ days: 90 }).toISOString();
    const companyName = faker.company.name();
    const location = createLondonLocationSeed();

    return {
      id: faker.string.uuid(),
      name: companyName,
      website_url: faker.internet.url(),
      linkedin_url: `https://www.linkedin.com/company/${faker.helpers.slugify(companyName).toLowerCase()}`,
      industry: faker.commerce.department(),
      size: faker.helpers.arrayElement([
        "1-10",
        "11-50",
        "51-200",
        "201-1000",
        "1000+",
      ]),
      location_text: location.locationText,
      location_lat: location.locationLat,
      location_lng: location.locationLng,
      notes: faker.company.catchPhrase(),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
