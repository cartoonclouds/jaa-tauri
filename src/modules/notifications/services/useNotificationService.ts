import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { NotificationRepository } from "@modules/notifications/repositories/NotificationRepository";
import { NotificationService } from "@modules/notifications/services/NotificationService";
import { useNuxtApp } from "nuxt/app";

export function useNotificationService(): NotificationService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new NotificationService(new NotificationRepository(database));
}
