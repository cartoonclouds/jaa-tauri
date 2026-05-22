import { CompanyRepository } from "@modules/companies/repositories/CompanyRepository";
import { CompanyService } from "@modules/companies/services/CompanyService";
import { useNuxtApp } from "nuxt/app";

let companyServiceInstance: CompanyService | null = null;

/**
 * Create a company service instance backed by the injected database driver.
 */
export function useCompanyService(): CompanyService {
  if (!companyServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    companyServiceInstance = new CompanyService(
      new CompanyRepository(database),
    );
  }

  return companyServiceInstance;
}
