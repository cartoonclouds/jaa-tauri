import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  NotificationCreatePayload,
  NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";

import { useNotificationService } from "@modules/notifications/services/useNotificationService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

export function useNotificationCrud() {
  const service = useNotificationService();
  return createCrudComposable<
    Notification,
    NotificationCreatePayload,
    NotificationUpdatePayload
  >(service);
}
