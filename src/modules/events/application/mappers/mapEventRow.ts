import type { Event } from "@modules/events/domain/entities/Event";

import { toInteractionStage } from "@modules/events/constants";
import {
  mapAuditTimestamps,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

/**
 * Map a raw database row into a typed event entity.
 */
export function mapEventRowToEntity(row: Record<string, unknown>): Event {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    applicationId: toRequiredString(row.application_id),
    type: toInteractionStage(row.type),
    title: toRequiredString(row.title),
    description: toNullableString(row.description),
    ...timestamps,
  };
}
