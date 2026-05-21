import { NotificationRepository } from "@modules/notifications/repositories/NotificationRepository";
import { NotificationService } from "@modules/notifications/services/NotificationService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create a notification service instance backed by the injected database driver.
 */
export function useNotificationService(): NotificationService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new NotificationService(new NotificationRepository(database));
}
