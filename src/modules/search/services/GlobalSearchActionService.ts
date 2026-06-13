import type { SearchResult } from "@modules/search/types";
import type { Router } from "vue-router";

interface GlobalSearchActionServiceDependencies {
  router: Router;
  openContactsDialog: (contactId?: string | null) => void;
  openCompaniesDialog: () => void;
}

/**
 * Handles side effects for selected global search results.
 */
export class GlobalSearchActionService {
  constructor(
    private readonly dependencies: GlobalSearchActionServiceDependencies,
  ) {}

  /**
   * Routes or opens dialogs based on the selected result type.
   */
  async handleResultSelection(result: SearchResult): Promise<void> {
    if (result.entityType === "applications" && result.targetId) {
      await this.dependencies.router.push({
        path: "/applications",
        query: { applicationId: result.targetId },
      });
      return;
    }

    if (result.entityType === "contacts" && result.targetId) {
      this.dependencies.openContactsDialog(result.targetId);
      return;
    }

    if (result.entityType === "companies" && result.targetId) {
      this.dependencies.openCompaniesDialog();
      return;
    }

    if (result.entityType === "locations" && result.locationText) {
      await this.dependencies.router.push({
        path: "/applications",
        query: { search: result.locationText },
      });
    }
  }
}
