import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type {
  CreateNotificationInput,
  Notification,
} from "@modules/notifications/domain/entities/Notification";

export async function createNotification(
  db: DatabaseDriver,
  input: CreateNotificationInput,
): Promise<string> {
  const title = input.title.trim();
  const body = input.body.trim();

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
      input.applicationId ?? null,
      input.eventId ?? null,
      input.severity ?? ("info" as Notification["severity"]),
      title,
      body,
    ],
  );

  return id;
}
