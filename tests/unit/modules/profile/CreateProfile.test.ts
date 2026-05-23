import { ProfileRepository } from "@modules/profile";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("ProfileRepository.create", () => {
  it("rejects missing full name", async () => {
    const db = mockDb();
    const repository = new ProfileRepository(db as never);

    await expect(repository.create({ fullName: "" })).rejects.toThrow(
      "Profile full name is required",
    );
  });

  it("inserts profile row", async () => {
    const db = mockDb();
    const repository = new ProfileRepository(db as never);

    await repository.create({ fullName: "John Doe" });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
