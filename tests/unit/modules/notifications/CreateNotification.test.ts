import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { NotificationRepository } from "@modules/notifications";
import { describe, expect, it, vi } from "vitest";
type LocalSelectRows = Record<string, unknown>[];

function createMockDb(rows: LocalSelectRows = []): {
  db: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn(() => Promise.resolve(rows));
  const executeMock = vi.fn(() => Promise.resolve({ rowsAffected: 0 }));
  const transactionMock = vi.fn(
    <T>(callback: (tx: DatabaseDriver) => Promise<T>) => callback(db),
  );

  const db = {
    name: "mock",
    select: selectMock,
    execute: executeMock,
    transaction: transactionMock,
  } as unknown as DatabaseDriver;

  return {
    db,
    selectMock,
    executeMock,
    transactionMock,
  };
}


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
