import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateProfileInput } from "@modules/profile/domain/entities/Profile";

import { z } from "zod";

const CreateProfileInputSchema = z.object({
  fullName: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  portfolioUrl: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  locationText: z.string().nullable().optional(),
  desiredSalary: z.number().nullable().optional(),
  salaryCurrency: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  remotePreference: z
    .enum(["remote", "hybrid", "onsite", "flexible"])
    .optional(),
  skills: z.array(z.string()).optional(),
  workEligibility: z.string().optional(),
  noticePeriodDays: z.number().nullable().optional(),
  interviewAvailability: z.string().optional(),
});

export async function createProfile(
  db: DatabaseDriver,
  input: CreateProfileInput,
): Promise<string> {
  const parseResult = CreateProfileInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Profile full name is required");
  }

  const fullName = parseResult.data.fullName.trim();
  if (!fullName) {
    throw new Error("Profile full name is required");
  }

  const id = crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO profiles (
      id,
      full_name,
      email,
      phone,
      linkedin_url,
      github_url,
      portfolio_url,
      headline,
      summary,
      location_text,
      desired_salary,
      salary_currency,
      preferred_locations,
      remote_preference,
      skills,
      work_eligibility,
      notice_period_days,
      interview_availability,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      id,
      fullName,
      parseResult.data.email ?? null,
      parseResult.data.phone ?? null,
      parseResult.data.linkedinUrl ?? null,
      parseResult.data.githubUrl ?? null,
      parseResult.data.portfolioUrl ?? null,
      parseResult.data.headline ?? null,
      parseResult.data.summary ?? null,
      parseResult.data.locationText ?? null,
      parseResult.data.desiredSalary ?? null,
      parseResult.data.salaryCurrency ?? "USD",
      JSON.stringify(parseResult.data.preferredLocations ?? []),
      parseResult.data.remotePreference ?? "flexible",
      JSON.stringify(parseResult.data.skills ?? []),
      parseResult.data.workEligibility ?? "",
      parseResult.data.noticePeriodDays ?? null,
      parseResult.data.interviewAvailability ?? "",
    ],
  );

  return id;
}
