import { CompanyRepository } from "@modules/companies";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("CompanyRepository.create", () => {
  it("rejects empty company name", async () => {
    const { db } = createMockDb();
    const repository = new CompanyRepository(db);

    await expect(repository.create({ name: "  " })).rejects.toThrow(
      "Company name is required",
    );
  });

  it("inserts a company row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new CompanyRepository(db);

    await repository.create({ name: "Acme Ltd" });

    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
