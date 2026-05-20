import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateNotificationInput } from "@modules/notifications/domain/entities/Notification";

import { z } from "zod";

const CreateNotificationInputSchema = z.object({
  applicationId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
  severity: z.enum(["info", "warning", "success", "error"]).optional(),
  title: z.string(),
  body: z.string(),
});

export async function createNotification(
  db: DatabaseDriver,
  input: CreateNotificationInput,
): Promise<string> {
  const parseResult = CreateNotificationInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Notification title and body are required");
  }

  const title = parseResult.data.title.trim();
  const body = parseResult.data.body.trim();
  if (!title || !body) {
    throw new Error("Notification title and body are required");
  }

  const id = crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO notifications (
      id,
      application_id,
      event_id,
      severity,
      title,
      body,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      id,
      parseResult.data.applicationId ?? null,
      parseResult.data.eventId ?? null,
      parseResult.data.severity ?? "info",
      title,
      body,
    ],
  );

  return id;
}
