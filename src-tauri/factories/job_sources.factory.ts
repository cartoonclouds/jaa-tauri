import { faker } from "@faker-js/faker";

export interface JobSourceRow {
  id: string;
  name: string;
  kind: string;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SOURCES = [
  {
    name: "LinkedIn",
    kind: "job_board",
    website_url: "https://www.linkedin.com/jobs",
  },
  { name: "Indeed", kind: "job_board", website_url: "https://www.indeed.com" },
  {
    name: "Wellfound",
    kind: "job_board",
    website_url: "https://wellfound.com/jobs",
  },
  { name: "Referral", kind: "referral", website_url: null },
  { name: "Recruiter Outreach", kind: "recruiter", website_url: null },
] as const;

export function createJobSourceRows(seed = 1300): JobSourceRow[] {
  return DEFAULT_SOURCES.map((source, index) => {
    faker.seed(seed + index);
    const createdAt = faker.date.past({ years: 1 }).toISOString();

    return {
      id: faker.string.uuid(),
      name: source.name,
      kind: source.kind,
      website_url: source.website_url,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
