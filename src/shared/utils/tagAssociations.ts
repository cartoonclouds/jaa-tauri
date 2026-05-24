import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

/**
 * Supported entities that can be tagged.
 */
export type TaggableEntity = "application" | "company" | "contact";

interface AssociationTableConfig {
  table: string;
  ownerColumn: string;
}

const ASSOCIATION_TABLE_BY_ENTITY: Record<
  TaggableEntity,
  AssociationTableConfig
> = {
  application: {
    table: "application_tags",
    ownerColumn: "application_id",
  },
  company: {
    table: "company_tags",
    ownerColumn: "company_id",
  },
  contact: {
    table: "contact_tags",
    ownerColumn: "contact_id",
  },
};

/**
 * List tag identifiers associated with a single entity.
 */
export async function listTagIdsForEntity(
  db: DatabaseDriver,
  entity: TaggableEntity,
  entityId: string,
): Promise<string[]> {
  const config = ASSOCIATION_TABLE_BY_ENTITY[entity];
  const rows = await db.select<{ tag_id: string }>(
    `SELECT tag_id
     FROM ${config.table}
     WHERE ${config.ownerColumn} = $1
     ORDER BY created_at ASC`,
    [entityId],
  );

  return rows.map((row) => row.tag_id);
}

/**
 * Replace all tag associations for a single entity.
 */
export async function syncTagIdsForEntity(
  db: DatabaseDriver,
  entity: TaggableEntity,
  entityId: string,
  tagIds: string[] | undefined,
): Promise<void> {
  const config = ASSOCIATION_TABLE_BY_ENTITY[entity];
  const normalizedTagIds = [...new Set((tagIds ?? []).filter(Boolean))];

  await db.transaction(async (tx) => {
    await tx.execute(
      `DELETE FROM ${config.table}
       WHERE ${config.ownerColumn} = $1`,
      [entityId],
    );

    for (const tagId of normalizedTagIds) {
      await tx.execute(
        `INSERT INTO ${config.table} (${config.ownerColumn}, tag_id, created_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [entityId, tagId],
      );
    }
  });
}
