import type { Profile } from "@modules/profile/domain/entities/Profile";

import {
  mapAuditTimestamps,
  normalizeLiteralValue,
  toNullableNumber,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";
import { parseStringArray } from "@shared/utils/parse";

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
    id: toRequiredString(row.id),
    fullName: toRequiredString(row.full_name),
    email: toNullableString(row.email),
    phone: toNullableString(row.phone),
    linkedinUrl: toNullableString(row.linkedin_url),
    githubUrl: toNullableString(row.github_url),
    portfolioUrl: toNullableString(row.portfolio_url),
    headline: toNullableString(row.headline),
    summary: toNullableString(row.summary),
    locationText: toNullableString(row.location_text),
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
    workEligibility: toNullableString(row.work_eligibility) ?? "",
    noticePeriodDays: toNullableNumber(row.notice_period_days),
    interviewAvailability: toNullableString(row.interview_availability) ?? "",
    ...timestamps,
  };

  void errorPrefix;
  return mapped;
}
