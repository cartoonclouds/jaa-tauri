import type { Company } from "@modules/companies/domain/entities/Company";

import { useCompanyService } from "@modules/companies/services/useCompanyService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for companies.
 */
export function useCompanyDatatable() {
  const service = useCompanyService();

  return useServerDatatable<Company>({
    fetchPage: (query) => service.listPage(query),
  });
}
