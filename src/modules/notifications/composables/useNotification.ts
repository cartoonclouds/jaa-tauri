import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  NotificationCreatePayload,
  NotificationUpdatePayload,
} from "@modules/notifications/types";

import { NotificationRepository } from "@modules/notifications/repositories/NotificationRepository";
import { NotificationService } from "@modules/notifications/services/NotificationService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createNotificationService(): NotificationService {
  const database = getNuxtDatabase();
  return new NotificationService(new NotificationRepository(database));
}

let notificationServiceInstance: NotificationService | null = null;

function getNotificationService(): NotificationService {
  notificationServiceInstance ??= createNotificationService();

  return notificationServiceInstance;
}

/**
 * Creates notification composable.
 */
function createNotificationComposable() {
  const service = getNotificationService();
  const crudComposable = createCrudComposable<
    Notification,
    NotificationCreatePayload,
    NotificationUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
}

/**
 * Type alias for notification composable.
 */
type NotificationComposable = ReturnType<typeof createNotificationComposable>;

let notificationComposableInstance: NotificationComposable | null = null;

/**
 * Create CRUD state and handlers for notifications.
 */
export function useNotification() {
  notificationComposableInstance ??= createNotificationComposable();

  return notificationComposableInstance;
}
