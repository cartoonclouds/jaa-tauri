import { NotificationRepository } from "@modules/notifications/repositories/NotificationRepository";
import { NotificationService } from "@modules/notifications/services/NotificationService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let notificationServiceInstance: NotificationService | null = null;

/**
 * Create a notification service instance backed by the injected database driver.
 */
export function useNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    const database = getNuxtDatabase();
    notificationServiceInstance = new NotificationService(
      new NotificationRepository(database),
    );
  }

  return notificationServiceInstance;
}
