import type { Profile } from "@modules/profile/domain/entities/Profile";

import { normalizeLiteralValue } from "@shared/utils/normalizationUtils";
import { toNullableNumber } from "@shared/utils/numberValueUtils";
import { parseStringArray } from "@shared/utils/parse";
import { mapAuditTimestamps } from "@shared/utils/rowDateUtils";

const REMOTE_PREFERENCE_VALUES = [
  "remote",
  "hybrid",
  "onsite",
  "flexible",
] as const;

/**
 * Map a raw database row into a typed profile entity.
 */
export function mapProfileRowToEntity(
  row: Record<string, unknown>,
  errorPrefix = "Profile row validation failed",
): Profile {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

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
    desiredSalary: toNullableNumber(row.desired_salary),
    salaryCurrency:
      typeof row.salary_currency === "string" ? row.salary_currency : "USD",
    preferredLocations: parseStringArray(row.preferred_locations),
    remotePreference: normalizeLiteralValue(
      row.remote_preference,
      REMOTE_PREFERENCE_VALUES,
      "flexible",
    ),
    skills: parseStringArray(row.skills),
    workEligibility: (row.work_eligibility as string | null) ?? "",
    noticePeriodDays: toNullableNumber(row.notice_period_days),
    interviewAvailability: (row.interview_availability as string | null) ?? "",
    ...timestamps,
  };

  void errorPrefix;
  return mapped;
}
