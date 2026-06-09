import {
  CompanyRepositoryCreateSchema,
  CompanySchema,
  CreateCompanySchema,
} from "@modules/companies/domain/zod/company.schema";
import { describe, expect, it } from "vitest";

import { buildCompanyCreatePayload } from "../../../fixtures/factories/testPayloadFactories";

describe("company schema", () => {
  it("accepts valid persisted and create company shapes", () => {
    expect(
      CompanySchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Acme Ltd",
        websiteUrl: "https://acme.example",
        linkedinUrl: null,
        industry: "Software",
        size: "51-200",
        locationText: "London",
        locationLat: 51.5072,
        locationLng: -0.1276,
        notes: null,
        tagIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).success,
    ).toBe(true);

    expect(CreateCompanySchema.safeParse(buildCompanyCreatePayload()).success).toBe(
      true,
    );
    expect(
      CompanyRepositoryCreateSchema.safeParse(buildCompanyCreatePayload()).success,
    ).toBe(true);
  });

  it("rejects invalid company names and invalid location coordinates", () => {
    expect(CreateCompanySchema.safeParse({ name: "" }).success).toBe(false);
    expect(
      CompanySchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Acme Ltd",
        websiteUrl: null,
        linkedinUrl: null,
        industry: null,
        size: null,
        locationText: "London",
        locationLat: 200,
        locationLng: -0.1276,
        notes: null,
        tagIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).success,
    ).toBe(false);
  });
});