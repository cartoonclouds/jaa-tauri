import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from "@modules/companies/repositories/CompanyRepository";

import { CompanyRepository } from "@modules/companies/repositories/CompanyRepository";
import { CompanyService } from "@modules/companies/services/CompanyService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createCompanyService(): CompanyService {
  const database = getNuxtDatabase();
  return new CompanyService(new CompanyRepository(database));
}

let companyServiceInstance: CompanyService | null = null;

function getCompanyService(): CompanyService {
  companyServiceInstance ??= createCompanyService();

  return companyServiceInstance;
}

/**
 * Creates company composable.
 */
function createCompanyComposable() {
  const service = getCompanyService();
  const crudComposable = createCrudComposable<
    Company,
    CompanyCreatePayload,
    CompanyUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
}

/**
 * Type alias for company composable.
 */
type CompanyComposable = ReturnType<typeof createCompanyComposable>;

let companyComposableInstance: CompanyComposable | null = null;

/**
 * Create CRUD state and handlers for companies.
 */
export function useCompany() {
  companyComposableInstance ??= createCompanyComposable();

  return companyComposableInstance;
}
