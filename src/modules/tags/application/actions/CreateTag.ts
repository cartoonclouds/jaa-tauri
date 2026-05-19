import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { CreateTagInput } from "@modules/tags/domain/entities/Tag";

export async function createTag(
  db: DatabaseDriver,
  input: CreateTagInput,
): Promise<string> {
  const name = input.name.trim().toLowerCase();

  if (!name) {
    throw new Error("Tag name is required");
  }

  const id = crypto.randomUUID();
  await db.execute(
    `
    INSERT INTO tags (id, name, color, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, name, input.color ?? null],
  );

  return id;
}
