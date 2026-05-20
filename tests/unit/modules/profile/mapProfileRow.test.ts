import { mapProfileRowToEntity } from "@modules/profile/application/mappers/mapProfileRow";
import { describe, expect, it } from "vitest";

describe("mapProfileRowToEntity", () => {
  it("keeps timestamp fields valid when the driver returns Date values", () => {
    const profile = mapProfileRowToEntity({
      id: "550e8400-e29b-41d4-a716-446655440000",
      full_name: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      linkedin_url: null,
      github_url: null,
      portfolio_url: null,
      headline: "Frontend Engineer",
      summary: null,
      location_text: null,
      desired_salary: 120000,
      salary_currency: "USD",
      preferred_locations: '["Berlin"]',
      remote_preference: "flexible",
      skills: '["Vue","TypeScript"]',
      work_eligibility: "EU",
      notice_period_days: 30,
      interview_availability: "Weekdays",
      created_at: new Date("2026-05-20T10:15:30.000Z"),
      updated_at: new Date("2026-05-20T10:20:30.000Z"),
    });

    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
    expect(profile.createdAt.toISOString()).toBe("2026-05-20T10:15:30.000Z");
    expect(profile.updatedAt.toISOString()).toBe("2026-05-20T10:20:30.000Z");
  });
});
