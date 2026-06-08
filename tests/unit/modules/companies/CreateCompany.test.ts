import { CompanyRepository } from "@modules/companies";
import { describe, expect, it } from "vitest";

import { buildCompanyCreatePayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("CompanyRepository.create", () => {
  it("rejects empty company name", async () => {
    const { db } = createMockDb();
    const repository = new CompanyRepository(db);

    await expect(
      repository.create(buildCompanyCreatePayload({ name: "  " })),
    ).rejects.toThrow("Company name is required");
  });

  it("inserts a company row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new CompanyRepository(db);

    await repository.create(buildCompanyCreatePayload());

    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
