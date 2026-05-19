import { createNotification } from "@modules/notifications";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createNotification", () => {
  it("rejects missing title/body", async () => {
    const db = mockDb();

    await expect(
      createNotification(db as never, { title: " ", body: " " }),
    ).rejects.toThrow("Notification title and body are required");
  });

  it("inserts a notification row", async () => {
    const db = mockDb();

    await createNotification(db as never, {
      title: "Reminder",
      body: "Follow up tomorrow",
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
