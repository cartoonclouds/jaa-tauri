import { EventRepository } from "@modules/events/repositories/EventRepository";
import { EventService } from "@modules/events/services/EventService";
import { useNuxtApp } from "nuxt/app";

let eventServiceInstance: EventService | null = null;

/**
 * Create an event service instance backed by the injected database driver.
 */
export function useEventService(): EventService {
  if (!eventServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    eventServiceInstance = new EventService(new EventRepository(database));
  }

  return eventServiceInstance;
}
