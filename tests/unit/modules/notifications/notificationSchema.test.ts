import {
  CreateNotificationSchema,
  NotificationRepositoryCreateSchema,
  NotificationSchema,
  SeveritySchema,
} from "@modules/notifications/domain/zod/notification.schema";
import { describe, expect, it } from "vitest";

import { buildNotificationCreatePayload } from "../../../fixtures/factories/testPayloadFactories";

describe("notification schema", () => {
  it("accepts valid persisted and create notification shapes", () => {
    expect(SeveritySchema.safeParse("warning").success).toBe(true);
    expect(
      NotificationSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440005",
        applicationId: null,
        eventId: null,
        severity: "info",
        title: "Reminder",
        body: "Follow up tomorrow",
        isRead: false,
        scheduledFor: null,
        sentAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).success,
    ).toBe(true);
    expect(
      CreateNotificationSchema.safeParse(buildNotificationCreatePayload()).success,
    ).toBe(true);
    expect(
      NotificationRepositoryCreateSchema.safeParse(
        buildNotificationCreatePayload(),
      ).success,
    ).toBe(true);
  });

  it("rejects invalid severities and blank notification text", () => {
    expect(SeveritySchema.safeParse("warn").success).toBe(false);
    expect(
      CreateNotificationSchema.safeParse(
        buildNotificationCreatePayload({ body: "" }),
      ).success,
    ).toBe(false);
  });
});