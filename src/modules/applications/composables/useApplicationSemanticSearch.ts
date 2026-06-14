import type { ApplicationSemanticSearchService } from "@modules/applications/services/ApplicationSemanticSearchService";

import { useApplication } from "@modules/applications/composables/useApplication";
import { ApplicationSemanticSearchService as ApplicationSemanticSearchServiceImpl } from "@modules/applications/services/ApplicationSemanticSearchService";
import { useCompany } from "@modules/companies";
import { useSemanticSearchService } from "@modules/search";

let applicationSemanticSearchServiceInstance: ApplicationSemanticSearchService | null =
  null;

/**
 * Returns singleton application semantic search service instance.
 */
export function useApplicationSemanticSearch(): ApplicationSemanticSearchService {
  if (applicationSemanticSearchServiceInstance) {
    return applicationSemanticSearchServiceInstance;
  }

  const { service: applicationService } = useApplication();
  const { service: companyService } = useCompany();
  const semanticSearchService = useSemanticSearchService();

  applicationSemanticSearchServiceInstance =
    new ApplicationSemanticSearchServiceImpl({
      semanticSearchService,
      loadApplications: () => applicationService.list(),
      loadCompanies: async () => {
        const companies = await companyService.list();
        return companies.map((company) => ({
          id: company.id,
          name: company.name,
        }));
      },
    });

  return applicationSemanticSearchServiceInstance;
}
