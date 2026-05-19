import type { Event } from "@modules/events/domain/entities/Event";
import type {
  EventCreatePayload,
  EventUpdatePayload,
} from "@modules/events/repositories/EventRepository";

import { useEventService } from "@modules/events/services/useEventService";
import { ref } from "vue";

export function useEventCrud() {
  const service = useEventService();
  const items = ref<Event[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: EventCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: EventUpdatePayload): Promise<void> {
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
