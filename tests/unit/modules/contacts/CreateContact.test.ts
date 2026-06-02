import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ContactRepository } from "@modules/contacts";
import { describe, expect, it, vi } from "vitest";
type LocalSelectRows = Record<string, unknown>[];

function createMockDb(rows: LocalSelectRows = []): {
  db: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn(() => Promise.resolve(rows));
  const executeMock = vi.fn(() => Promise.resolve({ rowsAffected: 0 }));
  const transactionMock = vi.fn(
    <T>(callback: (tx: DatabaseDriver) => Promise<T>) => callback(db),
  );

  const db = {
    name: "mock",
    select: selectMock,
    execute: executeMock,
    transaction: transactionMock,
  } as unknown as DatabaseDriver;

  return {
    db,
    selectMock,
    executeMock,
    transactionMock,
  };
}


describe("ContactRepository.create", () => {
  it("rejects empty full name", async () => {
    const { db } = createMockDb();
    const repository = new ContactRepository(db);

    await expect(
      repository.create({
        companyId: null,
        fullName: "  ",
        email: null,
        phone: null,
        linkedinUrl: null,
        locationText: null,
        locationLat: null,
        locationLng: null,
        type: "company",
        notes: null,
      }),
    ).rejects.toThrow("Contact full name is required");
  });

  it("inserts a contact row", async () => {
    const { db } = createMockDb();
    const repository = new ContactRepository(db);

    await repository.create({
      companyId: null,
      fullName: "Jane Recruiter",
      email: null,
      phone: null,
      linkedinUrl: null,
      locationText: null,
      locationLat: null,
      locationLng: null,
      type: "recruiter",
      notes: null,
    });

    expect(db.execute).toHaveBeenCalledTimes(2);
  });
});
