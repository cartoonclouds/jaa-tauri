import { NotificationRepository } from "@modules/notifications";
import { describe, expect, it } from "vitest";

import { buildNotificationCreatePayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("NotificationRepository.create", () => {
  it("rejects missing title/body", async () => {
    const { db } = createMockDb();
    const repository = new NotificationRepository(db);

    await expect(
      repository.create(
        buildNotificationCreatePayload({
          title: " ",
          body: " ",
        }),
      ),
    ).rejects.toThrow("Notification title and body are required");
  });

  it("inserts a notification row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new NotificationRepository(db);

    await repository.create(buildNotificationCreatePayload());

    expect(executeMock).toHaveBeenCalledOnce();
  });
});
