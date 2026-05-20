import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateEventInput } from "@modules/events/domain/entities/Event";

import { z } from "zod";

const CreateEventInputSchema = z.object({
  applicationId: z.string(),
  contactId: z.string().nullable().optional(),
  type: z.string(),
  title: z.string(),
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
  const type = parseResult.data.type.trim();
  const title = parseResult.data.title.trim();
  if (!type || !title) {
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
      type,
      title,
    ],
  );

  return id;
}
