import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Tag } from "@modules/tags/domain/entities/Tag";

import { mapTagRowToEntity } from "@modules/tags/application/mappers/mapTagRow";

export async function listTags(db: DatabaseDriver): Promise<Tag[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM tags ORDER BY name ASC",
  );

  return rows.map((row) => mapTagRowToEntity(row));
}
