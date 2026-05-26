import type { Tag } from "@modules/tags/domain/entities/Tag";

import { mapAuditTimestamps } from "@shared/utils/rowDateUtils";

/**
 * Map a raw database row into a typed tag entity.
 */
export function mapTagRowToEntity(row: Record<string, unknown>): Tag {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: String(row.id),
    name: String(row.name),
    color: (row.color as string | null) ?? null,
    ...timestamps,
  };
}
