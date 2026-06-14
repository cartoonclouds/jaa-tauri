import type {
  GlobalSearchActionServiceContract,
  SearchResult,
} from "@modules/search/types";

import { openSearchResult } from "@modules/search/utils/openSearchResult";

import { useRouter } from "#imports";
import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
import { useContactsDialog } from "@/composables/useContactsDialog";

/**
 * Creates a global search action service bound to UI navigation/dialog dependencies.
 */
export function useGlobalSearchActionService(): GlobalSearchActionServiceContract {
  const router = useRouter();
  const { openContactsDialog } = useContactsDialog();
  const { openCompaniesDialog } = useCompaniesDialog();

  return {
    async handleResultSelection(result: SearchResult): Promise<void> {
      await openSearchResult(result, {
        async applications(applicationId: string): Promise<void> {
          await router.push({
            path: "/applications",
            query: { applicationId },
          });
        },
        contacts(contactId: string): void {
          openContactsDialog(contactId);
        },
        companies(companyId: string): void {
          openCompaniesDialog(companyId);
        },
        async locations(locationText: string): Promise<void> {
          await router.push({
            path: "/applications",
            query: { search: locationText },
          });
        },
      });
    },
  };
}
