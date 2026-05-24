import { faker } from "@faker-js/faker";

export interface CompanyTagRow {
  company_id: string;
  tag_id: string;
  created_at: string;
}

export function createCompanyTagRows(
  companyIds: string[],
  tagIds: string[],
  tagsPerCompany = 1,
  seed = 2000,
): CompanyTagRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return companyIds.flatMap((companyId, companyIndex) =>
    Array.from({ length: tagsPerCompany }, (_, index) => {
      faker.seed(seed + companyIndex * 100 + index);

      return {
        company_id: companyId,
        tag_id: tagIds[(companyIndex + index) % tagIds.length],
        created_at: faker.date.recent({ days: 30 }).toISOString(),
      };
    }),
  );
}
