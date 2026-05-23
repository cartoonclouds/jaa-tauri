import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateEventInput } from "@modules/events/domain/entities/Event";

import { CreateEventSchema } from "@modules/events/domain/zod/event.schema";

const CreateEventInputSchema = CreateEventSchema.pick({
  applicationId: true,
  contactId: true,
  type: true,
  title: true,
});

export async function createEvent(
  db: DatabaseDriver,
  input: CreateEventInput,
): Promise<string> {
  const parseResult = CreateEventInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Event applicationId, type, and title are required");
  }

  if (!parseResult.data.applicationId) {
    throw new Error("Event applicationId, type, and title are required");
  }
  const title = parseResult.data.title.trim();
  if (!title) {
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
    [
      id,
      parseResult.data.applicationId,
      parseResult.data.contactId ?? null,
      parseResult.data.type,
      title,
    ],
  );

  return id;
}
