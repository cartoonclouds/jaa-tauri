import { faker } from "@faker-js/faker";

export interface ApplicationRow {
  id: string;
  company_id: string;
  title: string;
  status: string;
  source_url: string;
  applied_at: string;
  location_text: string;
  location_lat: number;
  location_lng: number;
  attendance_type: "remote" | "hybrid" | "on-site";
  employment_type:
    | "part-time"
    | "contract"
    | "internship"
    | "full-time"
    | "volunteer";
  salary_min: number;
  salary_max: number;
  currency: string;
  description: string;
  interview_process: string;
  benefits: string;
  priority: number;
  is_archived: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export function createApplicationRows(
  companyIds: string[],
  applicationsPerCompany = 2,
  seed = 1200,
): ApplicationRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return companyIds.flatMap((companyId, companyIndex) =>
    Array.from({ length: applicationsPerCompany }, (_, index) => {
      faker.seed(seed + companyIndex * 100 + index);
      const createdAt = faker.date.recent({ days: 60 }).toISOString();
      const salaryMin = faker.number.int({ min: 30000, max: 90000 });
      const salaryMax =
        salaryMin + faker.number.int({ min: 10000, max: 30000 });

      return {
        id: faker.string.uuid(),
        company_id: companyId,
        title: faker.person.jobTitle(),
        status: faker.helpers.arrayElement([
          "saved",
          "applied",
          "screening",
          "interviewing",
          "offer",
          "rejected",
        ]),
        source_url: faker.internet.url(),
        applied_at: faker.date.recent({ days: 45 }).toISOString(),
        location_text: faker.location.city(),
        location_lat: faker.location.latitude(),
        location_lng: faker.location.longitude(),
        attendance_type: faker.helpers.arrayElement([
          "remote",
          "hybrid",
          "on-site",
        ]),
        employment_type: faker.helpers.arrayElement([
          "part-time",
          "contract",
          "internship",
          "full-time",
          "volunteer",
        ]),
        salary_min: salaryMin,
        salary_max: salaryMax,
        currency: "GBP",
        description: faker.lorem.paragraph(),
        interview_process: faker.lorem.sentence(),
        benefits: faker.lorem.sentence(),
        priority: faker.number.int({ min: 1, max: 5 }),
        is_archived: 0,
        is_deleted: 0,
        created_at: createdAt,
        updated_at: createdAt,
      };
    }),
  );
}
