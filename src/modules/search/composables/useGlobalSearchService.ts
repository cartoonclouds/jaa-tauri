import { useApplication } from "@modules/applications";
import { useCompany } from "@modules/companies";
import { useContact } from "@modules/contacts";
import { GlobalSearchService } from "@modules/search/services/GlobalSearchService";

let globalSearchServiceInstance: GlobalSearchService | null = null;

/**
 * Returns a singleton global search service instance.
 */
export function useGlobalSearchService(): GlobalSearchService {
  if (globalSearchServiceInstance) {
    return globalSearchServiceInstance;
  }

  const { service: applicationService } = useApplication();
  const { service: contactService } = useContact();
  const { service: companyService } = useCompany();

  globalSearchServiceInstance = new GlobalSearchService({
    applicationService,
    contactService,
    companyService,
  });

  return globalSearchServiceInstance;
}
