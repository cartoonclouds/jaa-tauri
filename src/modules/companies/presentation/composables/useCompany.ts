import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from "@modules/companies/repositories/CompanyRepository";

import { useCompanyService } from "@modules/companies/services/useCompanyService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for companies.
 */
export function useCompany() {
  const service = useCompanyService();
  return createCrudComposable<
    Company,
    CompanyCreatePayload,
    CompanyUpdatePayload
  >(service);
}
