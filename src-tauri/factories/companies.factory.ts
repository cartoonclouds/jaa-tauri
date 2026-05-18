import { faker } from "@faker-js/faker";

export interface CompanyRow {
  id: string;
  name: string;
  website_url: string | null;
  linkedin_url: string | null;
  glassdoor_url: string | null;
  industry: string | null;
  size_range: string | null;
  location: string | null;
  notes: string | null;
  culture_notes: string | null;
  benefits: string | null;
  tech_stack: string | null;
  rating: number | null;
  red_flags: string | null;
  created_at: string;
  updated_at: string;
}

export function createCompanyRow(index: number, seed = 1400): CompanyRow {
  faker.seed(seed + index);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const name = faker.company.name();
  const createdAt = faker.date.past({ years: 2 }).toISOString();

  return {
    id: faker.string.uuid(),
    name,
    website_url: faker.internet.url(),
    linkedin_url: `https://www.linkedin.com/company/${faker.helpers.slugify(name).toLowerCase()}`,
    glassdoor_url:
      faker.helpers.maybe(() => faker.internet.url(), { probability: 0.7 }) ??
      null,
    industry: faker.company.buzzNoun(),
    size_range: faker.helpers.arrayElement([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "500+",
    ]),
    location: `${faker.location.city()}, ${faker.location.countryCode("alpha-2")}`,
    notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.8 }) ??
      null,
    culture_notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) ??
      null,
    benefits:
      faker.helpers.maybe(() => faker.lorem.words(4), { probability: 0.7 }) ??
      null,
    tech_stack:
      faker.helpers.maybe(
        () =>
          faker.helpers
            .arrayElements(
              ["Vue", "Nuxt", "TypeScript", "Tauri", "Rust", "PostgreSQL"],
              { min: 2, max: 4 },
            )
            .join(", "),
        { probability: 0.8 },
      ) ?? null,
    rating:
      faker.helpers.maybe(
        () =>
          Number(
            faker.number
              .float({ min: 2.5, max: 5, fractionDigits: 1 })
              .toFixed(1),
          ),
        { probability: 0.85 },
      ) ?? null,
    red_flags:
      faker.helpers.maybe(() => faker.lorem.words(5), { probability: 0.35 }) ??
      null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createCompanyRows(count: number, seed = 1400): CompanyRow[] {
  return Array.from({ length: count }, (_, index) =>
    createCompanyRow(index, seed),
  );
}
