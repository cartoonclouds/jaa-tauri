import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from "@modules/companies/repositories/CompanyRepository";

import { useCompanyService } from "@modules/companies";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

function createCompanyComposable() {
  const service = useCompanyService();
  return createCrudComposable<
    Company,
    CompanyCreatePayload,
    CompanyUpdatePayload
  >(service);
}

type CompanyComposable = ReturnType<typeof createCompanyComposable>;

let companyComposableInstance: CompanyComposable | null = null;

/**
 * Create CRUD state and handlers for companies.
 */
export function useCompany() {
  companyComposableInstance ??= createCompanyComposable();

  return companyComposableInstance;
}
