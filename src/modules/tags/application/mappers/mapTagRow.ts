import type { Tag } from "@modules/tags/domain/entities/Tag";

import { toDate } from "@shared/utils/toDate";

/**
 * Map a raw database row into a typed tag entity.
 */
export function mapTagRowToEntity(row: Record<string, unknown>): Tag {
  return {
    id: String(row.id),
    name: String(row.name),
    color: (row.color as string | null) ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}
