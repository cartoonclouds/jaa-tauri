import type { Event } from "@modules/events/domain/entities/Event";
import type {
  EventCreatePayload,
  EventUpdatePayload,
} from "@modules/events/repositories/EventRepository";

import { useEventService } from "@modules/events";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates event composable.
 */
function createEventComposable() {
  const service = useEventService();
  return createCrudComposable<Event, EventCreatePayload, EventUpdatePayload>(
    service,
  );
}

/**
 * Type alias for event composable.
 */
type EventComposable = ReturnType<typeof createEventComposable>;

let eventComposableInstance: EventComposable | null = null;

/**
 * Create CRUD state and handlers for events.
 */
export function useEvent() {
  eventComposableInstance ??= createEventComposable();

  return eventComposableInstance;
}








