import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from "@modules/companies/repositories/CompanyRepository";

import { useCompanyService } from "@modules/companies/services/useCompanyService";
import { ref } from "vue";

export function useCompanyCrud() {
  const service = useCompanyService();
  const items = ref<Company[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CompanyCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: CompanyUpdatePayload): Promise<void> {
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
