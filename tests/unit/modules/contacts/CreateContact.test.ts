import { ContactRepository } from "@modules/contacts";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  const db = {
    execute: vi.fn(() => Promise.resolve({ rowsAffected: 1 })),
    transaction: vi.fn((callback: (tx: unknown) => Promise<unknown>) =>
      callback(db),
    ),
  };

  return db;
}

describe("ContactRepository.create", () => {
  it("rejects empty full name", async () => {
    const db = mockDb();
    const repository = new ContactRepository(db as never);

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
    const db = mockDb();
    const repository = new ContactRepository(db as never);

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
