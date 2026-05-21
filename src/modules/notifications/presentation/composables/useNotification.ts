import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  NotificationCreatePayload,
  NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";

import { useNotificationService } from "@modules/notifications/services/useNotificationService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for notifications.
 */
export function useNotification() {
  const service = useNotificationService();
  return createCrudComposable<
    Notification,
    NotificationCreatePayload,
    NotificationUpdatePayload
  >(service);
}
