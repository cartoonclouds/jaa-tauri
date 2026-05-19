import { createApplication } from "@modules/applications";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createApplication", () => {
  it("rejects empty title", async () => {
    const db = mockDb();

    await expect(
      createApplication(db as never, { title: "   " }),
    ).rejects.toThrow("Application title is required");
  });

  it("writes a row with default status", async () => {
    const db = mockDb();

    await createApplication(db as never, { title: "Frontend Engineer" });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
