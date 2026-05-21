import { faker } from "@faker-js/faker";

export interface ApplicationRow {
  id: string;
  company_id: string;
  title: string;
  status: string;
  source_url: string;
  applied_at: string | null;
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

type ApplicationSeedStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

interface ApplicationLifecycleProfile {
  status: ApplicationSeedStatus;
  isArchived: number;
  priorityRange: {
    min: number;
    max: number;
  };
  appliedAtOffsetDays: {
    min: number;
    max: number;
  } | null;
}

const APPLICATION_LIFECYCLE_PROFILES: ApplicationLifecycleProfile[] = [
  {
    status: "saved",
    isArchived: 0,
    priorityRange: { min: 1, max: 2 },
    appliedAtOffsetDays: null,
  },
  {
    status: "applied",
    isArchived: 0,
    priorityRange: { min: 2, max: 3 },
    appliedAtOffsetDays: { min: 1, max: 5 },
  },
  {
    status: "interview",
    isArchived: 0,
    priorityRange: { min: 3, max: 4 },
    appliedAtOffsetDays: { min: 3, max: 12 },
  },
  {
    status: "offer",
    isArchived: 0,
    priorityRange: { min: 4, max: 5 },
    appliedAtOffsetDays: { min: 5, max: 18 },
  },
  {
    status: "rejected",
    isArchived: 1,
    priorityRange: { min: 1, max: 2 },
    appliedAtOffsetDays: { min: 4, max: 20 },
  },
];

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
      const createdAt = faker.date.recent({ days: 60 });
      const salaryMin = faker.number.int({ min: 30000, max: 90000 });
      const salaryMax =
        salaryMin + faker.number.int({ min: 10000, max: 30000 });
      const lifecycle = faker.helpers.arrayElement(
        APPLICATION_LIFECYCLE_PROFILES,
      );
      const appliedAt = lifecycle.appliedAtOffsetDays
        ? new Date(createdAt)
        : null;

      if (appliedAt && lifecycle.appliedAtOffsetDays) {
        appliedAt.setDate(
          appliedAt.getDate() +
            faker.number.int({
              min: lifecycle.appliedAtOffsetDays.min,
              max: lifecycle.appliedAtOffsetDays.max,
            }),
        );
      }

      return {
        id: faker.string.uuid(),
        company_id: companyId,
        title: faker.person.jobTitle(),
        status: lifecycle.status,
        source_url: faker.internet.url(),
        applied_at: appliedAt?.toISOString() ?? null,
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
        priority: faker.number.int(lifecycle.priorityRange),
        is_archived: lifecycle.isArchived,
        is_deleted: 0,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      };
    }),
  );
}
