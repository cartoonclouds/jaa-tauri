import type { Tag } from "@modules/tags/domain/entities/Tag";

import {
  mapAuditTimestamps,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

/**
 * Map a raw database row into a typed tag entity.
 */
export function mapTagRowToEntity(row: Record<string, unknown>): Tag {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    name: toRequiredString(row.name),
    color: toNullableString(row.color),
    ...timestamps,
  };
}
