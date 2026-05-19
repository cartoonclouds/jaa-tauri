import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  DocumentCreatePayload,
  DocumentUpdatePayload,
} from "@modules/documents/repositories/DocumentRepository";

import { useDocumentService } from "@modules/documents/services/useDocumentService";
import { ref } from "vue";

export function useDocumentCrud() {
  const service = useDocumentService();
  const items = ref<Document[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: DocumentCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: DocumentUpdatePayload): Promise<void> {
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
