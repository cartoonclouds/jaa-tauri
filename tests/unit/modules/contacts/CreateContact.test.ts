import { ContactRepository } from "@modules/contacts";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
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

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
