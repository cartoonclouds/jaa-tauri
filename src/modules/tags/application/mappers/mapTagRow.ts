import type { Tag } from "@modules/tags/domain/entities/Tag";
import type { TagModelType as TagModelTypeValue } from "@modules/tags/domain/enums/TagModelType";

import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import { EnumValue } from "@shared/domain/enums";
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

  const modelType: TagModelTypeValue =
    EnumValue.mapFromDbValue(row.model_type, TagModelType) ??
    TagModelType.General;

  return {
    id: toRequiredString(row.id),
    name: toRequiredString(row.name),
    color: toNullableString(row.color),
    modelType,
    ...timestamps,
  };
}
