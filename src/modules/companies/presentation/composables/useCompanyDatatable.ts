import type { Company } from "@modules/companies/domain/entities/Company";

import {
  COMPANY_SEARCH_FIELDS,
  type CompanySearchField,
} from "@modules/companies/constants/companyDatatableFields";
import { useCompanyService } from "@modules/companies/services/useCompanyService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for companies.
 */
export function useCompanyDatatable() {
  const service = useCompanyService();

  return useServerDatatable<Company, CompanySearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...COMPANY_SEARCH_FIELDS],
  });
}
