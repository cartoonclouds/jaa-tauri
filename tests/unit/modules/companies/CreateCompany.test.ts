import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { CompanyRepository } from "@modules/companies";
import { describe, expect, it, vi } from "vitest";

function createMockDb(): {
  db: DatabaseDriver;
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(() => Promise.resolve({ rowsAffected: 1 }));

  const db: DatabaseDriver = {
    name: "mock-db",
    select: vi.fn(() => Promise.resolve([])),
    execute: executeMock,
    transaction: async <T>(callback: (tx: DatabaseDriver) => Promise<T>) =>
      callback(db),
  };

  return { db, executeMock };
}

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
