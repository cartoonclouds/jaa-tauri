import { EventRepository } from "@modules/events";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    select: vi.fn(async (sql: unknown) => {
      if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
        return [{ id: "Interview/Technical Interview" }];
      }

      return [];
    }),
    execute: vi.fn(async (..._args: unknown[]) => ({ rowsAffected: 1 })),
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

  it("marks a canonical event as completed for an application", async () => {
    const db = mockDb();
    const repository = new EventRepository(db as never);

    await repository.create({
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
      description: null,
    });

    expect(db.execute).toHaveBeenCalledTimes(2);
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("uses a provided eventAt timestamp when creating the flow step", async () => {
    const db = mockDb();
    const repository = new EventRepository(db as never);
    const eventAt = "2026-05-29T09:30:00.000Z";

    await repository.create({
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
      description: null,
      eventAt,
    });

    expect(db.execute).toHaveBeenLastCalledWith(
      expect.stringContaining("COALESCE($3, CURRENT_TIMESTAMP)"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        eventAt,
      ],
    );
  });
});

describe("EventRepository.update", () => {
  it("uses a provided eventAt timestamp when updating an existing step", async () => {
    const db = mockDb();
    const repository = new EventRepository(db as never);
    const eventAt = "2026-06-01T14:15:00.000Z";

    await repository.update({
      id: "11111111-1111-4111-8111-111111111111::Interview/Technical Interview",
      type: "Interview/Technical Interview",
      eventAt,
    });

    expect(db.execute).toHaveBeenLastCalledWith(
      expect.stringContaining("SET event_at = $3"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        eventAt,
      ],
    );
  });
});
