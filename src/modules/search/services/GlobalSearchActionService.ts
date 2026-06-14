import type {
  GlobalSearchActionServiceContract,
  SearchResult,
} from "@modules/search/types";
import type { Router } from "vue-router";

import { openSearchResult } from "@modules/search/utils/openSearchResult";

interface GlobalSearchActionServiceDependencies {
  router: Router;
  openContactsDialog: (contactId?: string | null) => void;
  openCompaniesDialog: (companyId?: string | null) => void;
}

/**
 * Handles side effects for selected global search results.
 */
export class GlobalSearchActionService implements GlobalSearchActionServiceContract {
  constructor(
    private readonly dependencies: GlobalSearchActionServiceDependencies,
  ) {}

  /**
   * Routes or opens dialogs based on the selected result type.
   */
  async handleResultSelection(result: SearchResult): Promise<void> {
    const router = this.dependencies.router;

    await openSearchResult(result, {
      async applications(applicationId: string): Promise<void> {
        await router.push({
          path: "/applications",
          query: { applicationId },
        });
      },
      contacts: (contactId: string): void => {
        this.dependencies.openContactsDialog(contactId);
      },
      companies: (companyId: string): void => {
        this.dependencies.openCompaniesDialog(companyId);
      },
      async locations(locationText: string): Promise<void> {
        await router.push({
          path: "/applications",
          query: { search: locationText },
        });
      },
    });
  }
}
