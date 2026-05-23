import { EventRepository } from "@modules/events/repositories/EventRepository";
import { EventService } from "@modules/events/services/EventService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let eventServiceInstance: EventService | null = null;

/**
 * Create an event service instance backed by the injected database driver.
 */
export function useEventService(): EventService {
  if (!eventServiceInstance) {
    const database = getNuxtDatabase();
    eventServiceInstance = new EventService(new EventRepository(database));
  }

  return eventServiceInstance;
}
