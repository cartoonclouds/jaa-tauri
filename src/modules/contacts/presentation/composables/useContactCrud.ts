import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type {
  ContactCreatePayload,
  ContactUpdatePayload,
} from "@modules/contacts/repositories/ContactRepository";

import { useContactService } from "@modules/contacts/services/useContactService";
import { ref } from "vue";

export function useContactCrud() {
  const service = useContactService();
  const items = ref<Contact[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ContactCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: ContactUpdatePayload): Promise<void> {
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
