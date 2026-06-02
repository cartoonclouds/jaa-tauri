import { TagRepository } from "@modules/tags";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(() => Promise.resolve({ rowsAffected: 1 })),
  };
}

describe("TagRepository.create", () => {
  it("rejects empty tag name", async () => {
    const db = mockDb();
    const repository = new TagRepository(db as never);

    await expect(
      repository.create({ name: "  ", color: null }),
    ).rejects.toThrow("Tag name is required");
  });

  it("inserts tag row", async () => {
    const db = mockDb();
    const repository = new TagRepository(db as never);

    await repository.create({ name: "urgent", color: null });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
