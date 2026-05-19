import { createProfile } from "@modules/profile";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createProfile", () => {
  it("rejects missing full name", async () => {
    const db = mockDb();

    await expect(
      createProfile(db as never, { fullName: "" }),
    ).rejects.toThrow("Profile full name is required");
  });

  it("inserts profile row", async () => {
    const db = mockDb();

    await createProfile(db as never, { fullName: "John Doe" });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
