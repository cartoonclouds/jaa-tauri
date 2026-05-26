import type { Event } from "@modules/events/domain/entities/Event";

import { toInteractionStage } from "@modules/events/domain/constants/interactionStage";
import { mapAuditTimestamps } from "@shared/utils/rowDateUtils";

/**
 * Map a raw database row into a typed event entity.
 */
export function mapEventRowToEntity(row: Record<string, unknown>): Event {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: String(row.id),
    applicationId: String(row.application_id),
    type: toInteractionStage(row.type),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    ...timestamps,
  };
}
