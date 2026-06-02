import { NotificationRepository } from "@modules/notifications";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("NotificationRepository.create", () => {
  it("rejects missing title/body", async () => {
    const { db } = createMockDb();
    const repository = new NotificationRepository(db);

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
    const { db } = createMockDb();
    const repository = new NotificationRepository(db);

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
