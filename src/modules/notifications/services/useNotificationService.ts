import { NotificationRepository } from "@modules/notifications/repositories/NotificationRepository";
import { NotificationService } from "@modules/notifications/services/NotificationService";
import { useNuxtApp } from "nuxt/app";

let notificationServiceInstance: NotificationService | null = null;

/**
 * Create a notification service instance backed by the injected database driver.
 */
export function useNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    notificationServiceInstance = new NotificationService(
      new NotificationRepository(database),
    );
  }

  return notificationServiceInstance;
}
