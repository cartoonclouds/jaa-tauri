import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  NotificationCreatePayload,
  NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";

import { useNotificationService } from "@modules/notifications/services/useNotificationService";
import { ref } from "vue";

export function useNotificationCrud() {
  const service = useNotificationService();
  const items = ref<Notification[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: NotificationCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: NotificationUpdatePayload): Promise<void> {
    await service.update(payload);
    await refresh();
  }

  async function remove(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
  }

  void refresh();

  return { items, isLoading, refresh, create, update, remove };
}
