import { createContact } from "@modules/contacts";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createContact", () => {
  it("rejects empty full name", async () => {
    const db = mockDb();

    await expect(
      createContact(db as never, { fullName: "  ", type: "business" }),
    ).rejects.toThrow("Contact full name is required");
  });

  it("inserts a contact row", async () => {
    const db = mockDb();

    await createContact(db as never, {
      fullName: "Jane Recruiter",
      type: "recruiter",
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
