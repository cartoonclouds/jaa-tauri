import {
  ContactRepositoryCreateSchema,
  ContactSchema,
  ContactTypeSchema,
  CreateContactSchema,
} from "@modules/contacts/domain/zod/contact.schema";
import { temporalNowIsoString } from "@shared/utils/temporal";
import { describe, expect, it } from "vitest";

import { buildContactCreatePayload } from "../../../fixtures/factories/testPayloadFactories";

describe("contact schema", () => {
  it("accepts valid persisted and create contact shapes", () => {
    expect(ContactTypeSchema.safeParse("recruiter").success).toBe(true);
    expect(
      ContactSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440002",
        companyId: null,
        fullName: "Jane Recruiter",
        email: "jane@example.com",
        phone: null,
        linkedinUrl: null,
        locationText: "London",
        locationLat: 51.5,
        locationLng: -0.12,
        type: "recruiter",
        notes: null,
        tagIds: [],
        createdAt: temporalNowIsoString(),
        updatedAt: temporalNowIsoString(),
      }).success,
    ).toBe(true);
    expect(
      CreateContactSchema.safeParse(buildContactCreatePayload()).success,
    ).toBe(true);
    expect(
      ContactRepositoryCreateSchema.safeParse(buildContactCreatePayload())
        .success,
    ).toBe(true);
  });

  it("rejects invalid email and unsupported contact types", () => {
    expect(
      CreateContactSchema.safeParse(
        buildContactCreatePayload({ email: "not-an-email" }),
      ).success,
    ).toBe(false);
    expect(ContactTypeSchema.safeParse("friend").success).toBe(false);
  });
});
