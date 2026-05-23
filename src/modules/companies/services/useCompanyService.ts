import { CompanyRepository } from "@modules/companies/repositories/CompanyRepository";
import { CompanyService } from "@modules/companies/services/CompanyService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let companyServiceInstance: CompanyService | null = null;

/**
 * Create a company service instance backed by the injected database driver.
 */
export function useCompanyService(): CompanyService {
  if (!companyServiceInstance) {
    const database = getNuxtDatabase();
    companyServiceInstance = new CompanyService(
      new CompanyRepository(database),
    );
  }

  return companyServiceInstance;
}



