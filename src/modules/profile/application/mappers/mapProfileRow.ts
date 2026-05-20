import type { Profile } from "@modules/profile/domain/entities/Profile";

import { ProfileSchema } from "@shared/domain/zod/profile.schema";
import { parseStringArray } from "@shared/utils/parse";

export function mapProfileRowToEntity(
  row: Record<string, unknown>,
  errorPrefix = "Profile row validation failed",
): Profile {
  const mapped = {
    id: String(row.id),
    fullName: String(row.full_name),
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    linkedinUrl: (row.linkedin_url as string | null) ?? null,
    githubUrl: (row.github_url as string | null) ?? null,
    portfolioUrl: (row.portfolio_url as string | null) ?? null,
    headline: (row.headline as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    locationText: (row.location_text as string | null) ?? null,
    desiredSalary:
      typeof row.desired_salary === "number" ? row.desired_salary : null,
    salaryCurrency:
      typeof row.salary_currency === "string" ? row.salary_currency : "USD",
    preferredLocations: parseStringArray(row.preferred_locations),
    remotePreference:
      row.remote_preference === "remote" ||
      row.remote_preference === "hybrid" ||
      row.remote_preference === "onsite" ||
      row.remote_preference === "flexible"
        ? row.remote_preference
        : "flexible",
    skills: parseStringArray(row.skills),
    workEligibility: (row.work_eligibility as string | null) ?? "",
    noticePeriodDays:
      typeof row.notice_period_days === "number"
        ? row.notice_period_days
        : null,
    interviewAvailability: (row.interview_availability as string | null) ?? "",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  const parsed = ProfileSchema.safeParse(mapped);
  if (!parsed.success) {
    throw new Error(`${errorPrefix}: ${JSON.stringify(parsed.error.format())}`);
  }

  return parsed.data as Profile;
}
