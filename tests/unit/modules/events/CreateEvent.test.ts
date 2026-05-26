import { EventRepository } from "@modules/events";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("EventRepository.create", () => {
  it("rejects missing required fields", async () => {
    const db = mockDb();
    const repository = new EventRepository(db as never);

    await expect(
      repository.create({
        applicationId: "",
        type: "" as never,
        title: "",
        description: null,
      }),
    ).rejects.toThrow("Event applicationId, type, and title are required");
  });

  it("inserts an event row", async () => {
    const db = mockDb();
    const repository = new EventRepository(db as never);

    await repository.create({
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
      description: null,
    });

    expect(db.execute).toHaveBeenCalledTimes(2);
  });
});
