import { createEvent } from "@modules/events";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createEvent", () => {
  it("rejects missing required fields", async () => {
    const db = mockDb();

    await expect(
      createEvent(db as never, {
        applicationId: "",
        type: "" as never,
        title: "",
      }),
    ).rejects.toThrow("Event applicationId, type, and title are required");
  });

  it("inserts an event row", async () => {
    const db = mockDb();

    await createEvent(db as never, {
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
