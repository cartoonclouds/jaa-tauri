import { ContactRepository } from "@modules/contacts";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

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
