import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Tag } from "@modules/tags/domain/entities/Tag";

export async function listTags(db: DatabaseDriver): Promise<Tag[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM tags ORDER BY name ASC",
  );

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    color: (row.color as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}
