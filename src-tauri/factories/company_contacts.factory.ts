import { faker } from "@faker-js/faker";

export interface CompanyContactRow {
  id: string;
  company_id: string;
  full_name: string;
  role: "recruiter" | "hiring_manager" | "interviewer" | "other";
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  agency_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const ROLES: CompanyContactRow["role"][] = [
  "recruiter",
  "hiring_manager",
  "interviewer",
  "other",
];

export function createCompanyContactRow(
  companyId: string,
  index: number,
  seed = 1500,
): CompanyContactRow {
  faker.seed(seed + index);

  const fullName = faker.person.fullName();
  const createdAt = faker.date.past({ years: 1 }).toISOString();

  return {
    id: faker.string.uuid(),
    company_id: companyId,
    full_name: fullName,
    role: faker.helpers.arrayElement(ROLES),
    email: faker.internet.email({ firstName: fullName.split(" ")[0] }),
    phone: faker.phone.number(),
    linkedin_url:
      faker.helpers.maybe(() => faker.internet.url(), { probability: 0.8 }) ??
      null,
    agency_name:
      faker.helpers.maybe(() => faker.company.name(), { probability: 0.4 }) ??
      null,
    notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) ??
      null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createCompanyContactRows(
  companyIds: string[],
  contactsPerCompany = 2,
  seed = 1500,
): CompanyContactRow[] {
  return companyIds.flatMap((companyId, companyIndex) =>
    Array.from({ length: contactsPerCompany }, (_, contactIndex) => {
      const index = companyIndex * contactsPerCompany + contactIndex;
      return createCompanyContactRow(companyId, index, seed);
    }),
  );
}
