import type { Event } from "@modules/events/domain/entities/Event";
import type {
  EventCreatePayload,
  EventUpdatePayload,
} from "@modules/events/repositories/EventRepository";

import { useEventService } from "@modules/events/services/useEventService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for events.
 */
export function useEvent() {
  const service = useEventService();
  return createCrudComposable<Event, EventCreatePayload, EventUpdatePayload>(
    service,
  );
}
