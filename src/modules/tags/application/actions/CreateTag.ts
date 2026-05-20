import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateTagInput } from "@modules/tags/domain/entities/Tag";

import { z } from "zod";

const CreateTagInputSchema = z.object({
  name: z.string(),
  color: z.string().nullable().optional(),
});

export async function createTag(
  db: DatabaseDriver,
  input: CreateTagInput,
): Promise<string> {
  const parseResult = CreateTagInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error("Tag name is required");
  }

  const name = parseResult.data.name.trim().toLowerCase();
  if (!name) {
    throw new Error("Tag name is required");
  }

  const id = crypto.randomUUID();
  await db.execute(
    `
    INSERT INTO tags (id, name, color, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, name, parseResult.data.color ?? null],
  );

  return id;
}
