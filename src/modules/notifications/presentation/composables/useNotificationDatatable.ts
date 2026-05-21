import type { Notification } from "@modules/notifications/domain/entities/Notification";

import { useNotificationService } from "@modules/notifications/services/useNotificationService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for notifications.
 */
export function useNotificationDatatable() {
  const service = useNotificationService();

  return useServerDatatable<Notification>({
    fetchPage: (query) => service.listPage(query),
  });
}
