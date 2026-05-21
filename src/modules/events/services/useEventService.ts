import { EventRepository } from "@modules/events/repositories/EventRepository";
import { EventService } from "@modules/events/services/EventService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create an event service instance backed by the injected database driver.
 */
export function useEventService(): EventService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new EventService(new EventRepository(database));
}
