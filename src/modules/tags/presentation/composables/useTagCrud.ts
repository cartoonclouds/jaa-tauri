import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  TagCreatePayload,
  TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

import { useTagService } from "@modules/tags/services/useTagService";
import { ref } from "vue";

export function useTagCrud() {
  const service = useTagService();
  const items = ref<Tag[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: TagCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: TagUpdatePayload): Promise<void> {
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
