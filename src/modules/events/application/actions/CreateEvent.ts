import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateEventInput } from "@modules/events/domain/entities/Event";

export async function createEvent(
  db: DatabaseDriver,
  input: CreateEventInput,
): Promise<string> {
  const type = input.type.trim();
  const title = input.title.trim();

  if (!input.applicationId || !type || !title) {
    throw new Error("Event applicationId, type, and title are required");
  }

  const id = crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO events (
      id,
      application_id,
      contact_id,
      type,
      title,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, input.applicationId, input.contactId ?? null, type, title],
  );

  return id;
}
