import { CompanyRepository } from "@modules/companies";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  const db = {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(db),
    ),
  };

  return db;
}

describe("CompanyRepository.create", () => {
  it("rejects empty company name", async () => {
    const db = mockDb();
    const repository = new CompanyRepository(db as never);

    await expect(repository.create({ name: "  " })).rejects.toThrow(
      "Company name is required",
    );
  });

  it("inserts a company row", async () => {
    const db = mockDb();
    const repository = new CompanyRepository(db as never);

    await repository.create({ name: "Acme Ltd" });

    expect(db.execute).toHaveBeenCalledTimes(2);
  });
});
