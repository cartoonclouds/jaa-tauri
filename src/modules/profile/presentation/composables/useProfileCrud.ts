import type { Profile } from "@modules/profile/domain/entities/Profile";
import type {
  ProfileCreatePayload,
  ProfileUpdatePayload,
} from "@modules/profile/repositories/ProfileRepository";

import { useProfileService } from "@modules/profile/services/useProfileService";
import { ref } from "vue";

export function useProfileCrud() {
  const service = useProfileService();
  const items = ref<Profile[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ProfileCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: ProfileUpdatePayload): Promise<void> {
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
