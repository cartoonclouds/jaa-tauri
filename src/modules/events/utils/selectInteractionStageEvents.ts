import type { Event } from "@modules/events/domain/entities/Event";

import { isInteractionStage } from "@modules/events/constants";

/**
 * Return interaction-stage events for a specific application in deterministic order.
 */
export function selectInteractionStageEvents(
  events: Event[],
  applicationId: string | null | undefined,
): Event[] {
  if (!applicationId) {
    return [];
  }

  return events
    .filter(
      (event) =>
        event.applicationId === applicationId && isInteractionStage(event.type),
    )
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.id.localeCompare(right.id);
    });
}
