import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { SettingUpsertPayload } from "@modules/settings/repositories/SettingRepository";

import { useSettingService } from "@modules/settings/services/useSettingService";
import { ref } from "vue";

export function useSettingCrud() {
  const service = useSettingService();
  const items = ref<Setting[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function upsert(payload: SettingUpsertPayload): Promise<void> {
    await service.upsert(payload);
    await refresh();
  }

  async function remove(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
  }

  void refresh();

  return { items, isLoading, refresh, upsert, remove };
}
