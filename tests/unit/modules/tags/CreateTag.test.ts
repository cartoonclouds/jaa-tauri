import { TagRepository } from "@modules/tags";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("TagRepository.create", () => {
  it("rejects empty tag name", async () => {
    const { db } = createMockDb();
    const repository = new TagRepository(db);

    await expect(
      repository.create({ name: "  ", color: null }),
    ).rejects.toThrow("Tag name is required");
  });

  it("inserts tag row", async () => {
    const { db } = createMockDb();
    const repository = new TagRepository(db);

    await repository.create({ name: "urgent", color: null });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
