import type { Event } from "@modules/events/domain/entities/Event";

import { toInteractionStage } from "@modules/events/domain/constants/interactionStage";
import { toDate } from "@shared/utils/toDate";

/**
 * Map a raw database row into a typed event entity.
 */
export function mapEventRowToEntity(row: Record<string, unknown>): Event {
  return {
    id: String(row.id),
    applicationId: String(row.application_id),
    type: toInteractionStage(row.type),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}
