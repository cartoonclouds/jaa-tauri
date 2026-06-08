import type { Event } from "@modules/events/domain/entities/Event";
import type {
  EventCreatePayload,
  EventUpdatePayload,
} from "@modules/events/types";

import { EventRepository } from "@modules/events/repositories/EventRepository";
import { EventService } from "@modules/events/services/EventService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createEventService(): EventService {
  const database = getNuxtDatabase();
  return new EventService(new EventRepository(database));
}

let eventServiceInstance: EventService | null = null;

function getEventService(): EventService {
  eventServiceInstance ??= createEventService();

  return eventServiceInstance;
}

/**
 * Creates event composable.
 */
function createEventComposable() {
  const service = getEventService();
  const crudComposable = createCrudComposable<
    Event,
    EventCreatePayload,
    EventUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
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
