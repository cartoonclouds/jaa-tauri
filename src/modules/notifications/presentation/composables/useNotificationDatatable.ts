import type { Notification } from "@modules/notifications/domain/entities/Notification";

import {
  NOTIFICATION_SEARCH_FIELDS,
  type NotificationSearchField,
} from "@modules/notifications/constants/notificationDatatableFields";
import { useNotificationService } from "@modules/notifications/services/useNotificationService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for notifications.
 */
export function useNotificationDatatable() {
  const service = useNotificationService();

  return useServerDatatable<Notification, NotificationSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...NOTIFICATION_SEARCH_FIELDS],
  });
}
