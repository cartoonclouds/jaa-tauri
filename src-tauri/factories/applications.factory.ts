import { faker } from "@faker-js/faker";

export interface ApplicationRow {
  id: string;
  company_id: string | null;
  company_name_snapshot: string;
  job_title: string;
  status:
    | "saved"
    | "applied"
    | "recruiter_contacted"
    | "screening"
    | "technical_test"
    | "interviewing"
    | "offer"
    | "rejected"
    | "withdrawn"
    | "accepted"
    | "ghosted";
  applied_at: string | null;
  source_id: string | null;
  source_platform: string | null;
  job_advert_url: string | null;
  advert_snapshot_path: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  contract_type: string | null;
  location_text: string | null;
  work_mode: "remote" | "hybrid" | "onsite" | "unknown";
  priority: number;
  notes: string | null;
  duplicate_key: string | null;
  is_archived: number;
  is_deleted: number;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUSES: ApplicationRow["status"][] = [
  "saved",
  "applied",
  "recruiter_contacted",
  "screening",
  "technical_test",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
  "accepted",
  "ghosted",
];

const WORK_MODES: ApplicationRow["work_mode"][] = [
  "remote",
  "hybrid",
  "onsite",
  "unknown",
];

export function createApplicationRow(
  args: {
    companyId: string | null;
    companyNameSnapshot: string;
    sourceId: string | null;
    sourcePlatform?: string | null;
  },
  index: number,
  seed = 1600,
): ApplicationRow {
  faker.seed(seed + index);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const createdAt = faker.date.recent({ days: 180 }).toISOString();
  const status = faker.helpers.arrayElement(STATUSES);
  const appliedAt =
    status === "saved" ? null : faker.date.recent({ days: 120 }).toISOString();
  const salaryMin = faker.number.int({ min: 50000, max: 90000 });
  const salaryMax = salaryMin + faker.number.int({ min: 5000, max: 40000 });

  return {
    id: faker.string.uuid(),
    company_id: args.companyId,
    company_name_snapshot: args.companyNameSnapshot,
    job_title: faker.person.jobTitle(),
    status,
    applied_at: appliedAt,
    source_id: args.sourceId,
    source_platform: args.sourcePlatform ?? null,
    job_advert_url: faker.internet.url(),
    advert_snapshot_path:
      faker.helpers.maybe(
        () =>
          `/snapshots/job-${faker.number.int({ min: 1000, max: 9999 })}.pdf`,
        { probability: 0.6 },
      ) ?? null,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: "USD",
    contract_type: faker.helpers.arrayElement([
      "full_time",
      "contract",
      "part_time",
    ]),
    location_text: `${faker.location.city()}, ${faker.location.countryCode("alpha-2")}`,
    work_mode: faker.helpers.arrayElement(WORK_MODES),
    priority: faker.number.int({ min: 1, max: 5 }),
    notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) ??
      null,
    duplicate_key:
      faker.helpers.maybe(
        () =>
          `${args.companyNameSnapshot.toLowerCase()}::${faker.helpers.slugify(faker.person.jobTitle()).toLowerCase()}`,
        { probability: 0.2 },
      ) ?? null,
    is_archived: faker.helpers.arrayElement([0, 1]),
    is_deleted: 0,
    closed_at: ["rejected", "withdrawn", "accepted"].includes(status)
      ? faker.date.recent({ days: 30 }).toISOString()
      : null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createApplicationRows(
  companies: Array<{ id: string; name: string }>,
  sourceIds: string[],
  applicationsPerCompany = 2,
  seed = 1600,
): ApplicationRow[] {
  return companies.flatMap((company, companyIndex) =>
    Array.from({ length: applicationsPerCompany }, (_, appIndex) => {
      const index = companyIndex * applicationsPerCompany + appIndex;
      return createApplicationRow(
        {
          companyId: company.id,
          companyNameSnapshot: company.name,
          sourceId: sourceIds[index % sourceIds.length] ?? null,
          sourcePlatform: null,
        },
        index,
        seed,
      );
    }),
  );
}
