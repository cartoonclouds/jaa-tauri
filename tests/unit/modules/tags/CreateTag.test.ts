import { createTag } from "@modules/tags";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createTag", () => {
  it("rejects empty tag name", async () => {
    const db = mockDb();

    await expect(createTag(db as never, { name: "  " })).rejects.toThrow(
      "Tag name is required",
    );
  });

  it("inserts tag row", async () => {
    const db = mockDb();

    await createTag(db as never, { name: "urgent" });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
