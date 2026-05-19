import { createCompany } from "@modules/companies";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createCompany", () => {
  it("rejects empty company name", async () => {
    const db = mockDb();

    await expect(createCompany(db as never, { name: "  " })).rejects.toThrow(
      "Company name is required",
    );
  });

  it("inserts a company row", async () => {
    const db = mockDb();

    await createCompany(db as never, { name: "Acme Ltd" });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
