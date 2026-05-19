import { faker } from "@faker-js/faker";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  portfolio_url: string;
  headline: string;
  summary: string;
  location_text: string;
  created_at: string;
  updated_at: string;
}

export function createProfileRow(seed = 1800): ProfileRow {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");
  const createdAt = faker.date.recent({ days: 30 }).toISOString();
  const fullName = faker.person.fullName();

  return {
    id: faker.string.uuid(),
    full_name: fullName,
    email: faker.internet.email({ firstName: fullName.split(" ")[0] }),
    phone: faker.phone.number(),
    linkedin_url: `https://www.linkedin.com/in/${faker.helpers.slugify(fullName).toLowerCase()}`,
    portfolio_url: faker.internet.url(),
    headline: faker.person.jobTitle(),
    summary: faker.lorem.paragraph(),
    location_text: faker.location.city(),
    created_at: createdAt,
    updated_at: createdAt,
  };
}
