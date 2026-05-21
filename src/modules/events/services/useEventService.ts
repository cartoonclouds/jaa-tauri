import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { EventRepository } from "@modules/events/repositories/EventRepository";
import { EventService } from "@modules/events/services/EventService";
import { useNuxtApp } from "nuxt/app";

export function useEventService(): EventService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new EventService(new EventRepository(database));
}
