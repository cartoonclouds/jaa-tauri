import { faker } from "@faker-js/faker";

export interface CompanyRow {
  id: string;
  name: string;
  website_url: string;
  linkedin_url: string;
  industry: string;
  size: string;
  location_text: string;
  location_lat: number;
  location_lng: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function createCompanyRows(count: number, seed = 1000): CompanyRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return Array.from({ length: count }, () => {
    const createdAt = faker.date.recent({ days: 90 }).toISOString();
    const companyName = faker.company.name();

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
      location_text: faker.location.city(),
      location_lat: faker.location.latitude(),
      location_lng: faker.location.longitude(),
      notes: faker.company.catchPhrase(),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
