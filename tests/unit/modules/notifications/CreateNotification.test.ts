import { NotificationRepository } from "@modules/notifications";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("NotificationRepository.create", () => {
  it("rejects missing title/body", async () => {
    const db = mockDb();
    const repository = new NotificationRepository(db as never);

    await expect(
      repository.create({
        applicationId: null,
        eventId: null,
        severity: "info",
        title: " ",
        body: " ",
        isRead: false,
        scheduledFor: null,
        sentAt: null,
      }),
    ).rejects.toThrow("Notification title and body are required");
  });

  it("inserts a notification row", async () => {
    const db = mockDb();
    const repository = new NotificationRepository(db as never);

    await repository.create({
      applicationId: null,
      eventId: null,
      title: "Reminder",
      body: "Follow up tomorrow",
      severity: "info",
      isRead: false,
      scheduledFor: null,
      sentAt: null,
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
