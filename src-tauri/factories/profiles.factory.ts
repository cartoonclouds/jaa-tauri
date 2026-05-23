import { faker } from "@faker-js/faker";

import {
  createLondonLocationSeed,
  createPreferredLondonLocations,
} from "./location.factory";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  headline: string;
  summary: string;
  location_text: string;
  desired_salary: number;
  salary_currency: string;
  preferred_locations: string;
  remote_preference: "remote" | "hybrid" | "onsite" | "flexible";
  skills: string;
  work_eligibility: string;
  notice_period_days: number;
  interview_availability: string;
  created_at: string;
  updated_at: string;
}

export function createProfileRow(seed = 1800): ProfileRow {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");
  const createdAt = faker.date.recent({ days: 30 }).toISOString();
  const fullName = faker.person.fullName();
  const location = createLondonLocationSeed();

  return {
    id: faker.string.uuid(),
    full_name: fullName,
    email: faker.internet.email({ firstName: fullName.split(" ")[0] }),
    phone: faker.phone.number(),
    linkedin_url: `https://www.linkedin.com/in/${faker.helpers.slugify(fullName).toLowerCase()}`,
    github_url: `https://github.com/${faker.helpers.slugify(fullName).toLowerCase()}`,
    portfolio_url: faker.internet.url(),
    headline: faker.person.jobTitle(),
    summary: faker.lorem.paragraph(),
    location_text: location.locationText,
    desired_salary: faker.number.int({ min: 40000, max: 120000 }),
    salary_currency: faker.helpers.arrayElement(["GBP", "USD", "EUR"]),
    preferred_locations: JSON.stringify(createPreferredLondonLocations()),
    remote_preference: faker.helpers.arrayElement([
      "remote",
      "hybrid",
      "onsite",
      "flexible",
    ]),
    skills: JSON.stringify([faker.person.jobType(), faker.company.buzzNoun()]),
    work_eligibility: faker.helpers.arrayElement([
      "UK",
      "EU",
      "US",
      "Remote-friendly",
    ]),
    notice_period_days: faker.helpers.arrayElement([0, 14, 30, 60]),
    interview_availability: faker.lorem.sentence(),
    created_at: createdAt,
    updated_at: createdAt,
  };
}
