import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/repositories/ApplicationRepository";

import { useApplicationService } from "@modules/applications/services/useApplicationService";
import { ref } from "vue";

export function useApplicationCrud() {
  const service = useApplicationService();
  const items = ref<Application[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ApplicationCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: ApplicationUpdatePayload): Promise<void> {
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
