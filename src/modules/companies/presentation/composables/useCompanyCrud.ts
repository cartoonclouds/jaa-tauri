import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from "@modules/companies/repositories/CompanyRepository";

import { useCompanyService } from "@modules/companies/services/useCompanyService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

export function useCompanyCrud() {
  const service = useCompanyService();
  return createCrudComposable<
    Company,
    CompanyCreatePayload,
    CompanyUpdatePayload
  >(service);
}
