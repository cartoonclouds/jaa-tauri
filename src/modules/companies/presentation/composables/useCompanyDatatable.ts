import type { Company } from "@modules/companies/domain/entities/Company";

import { useCompanyService } from "@modules/companies/services/useCompanyService";

import { useServerDatatable } from "@/composables/useServerDatatable";

export function useCompanyDatatable() {
  const service = useCompanyService();

  return useServerDatatable<Company>({
    fetchPage: (query) => service.listPage(query),
  });
}
