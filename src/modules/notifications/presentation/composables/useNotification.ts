import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  NotificationCreatePayload,
  NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";

import { useNotificationService } from "@modules/notifications";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates notification composable.
 */
function createNotificationComposable() {
  const service = useNotificationService();
  return createCrudComposable<
    Notification,
    NotificationCreatePayload,
    NotificationUpdatePayload
  >(service);
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








