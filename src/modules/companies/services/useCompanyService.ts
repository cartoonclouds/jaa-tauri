import { CompanyRepository } from "@modules/companies/repositories/CompanyRepository";
import { CompanyService } from "@modules/companies/services/CompanyService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create a company service instance backed by the injected database driver.
 */
export function useCompanyService(): CompanyService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new CompanyService(new CompanyRepository(database));
}
