import {
  CreateProfileSchema,
  ProfileRepositoryCreateSchema,
  ProfileRepositoryUpdateSchema,
  ProfileSchema,
} from "@modules/profile/domain/zod/profile.schema";
import { temporalNowIsoString } from "@shared/utils/temporal";
import { describe, expect, it } from "vitest";

describe("profile schema", () => {
  const validProfile = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: null,
    linkedinUrl: "https://linkedin.com/in/jane-doe",
    githubUrl: "https://github.com/jane-doe",
    portfolioUrl: null,
    headline: "Frontend Engineer",
    summary: null,
    locationText: null,
    desiredSalary: 120000,
    salaryCurrency: "USD",
    preferredLocations: ["Berlin"],
    remotePreference: "flexible",
    skills: ["Vue", "TypeScript"],
    workEligibility: "EU",
    noticePeriodDays: 30,
    interviewAvailability: "Weekdays",
  } as const;

  it("accepts valid persisted, create, repository create, and repository update shapes", () => {
    expect(
      ProfileSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440006",
        ...validProfile,
        createdAt: temporalNowIsoString(),
        updatedAt: temporalNowIsoString(),
      }).success,
    ).toBe(true);
    expect(CreateProfileSchema.safeParse(validProfile).success).toBe(true);
    expect(ProfileRepositoryCreateSchema.safeParse(validProfile).success).toBe(
      true,
    );
    expect(
      ProfileRepositoryUpdateSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440006",
        headline: "Staff Engineer",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid emails and invalid update ids", () => {
    expect(
      CreateProfileSchema.safeParse({
        ...validProfile,
        email: "invalid-email",
      }).success,
    ).toBe(false);
    expect(
      ProfileRepositoryUpdateSchema.safeParse({
        id: "not-a-uuid",
        fullName: "Jane Doe",
      }).success,
    ).toBe(false);
  });
});
