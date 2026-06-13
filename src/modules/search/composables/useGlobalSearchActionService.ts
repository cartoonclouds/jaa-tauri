import { GlobalSearchActionService } from "@modules/search/services/GlobalSearchActionService";

import { useRouter } from "#imports";
import { useCompaniesDialog } from "@/composables/useCompaniesDialog";
import { useContactsDialog } from "@/composables/useContactsDialog";

/**
 * Creates a global search action service bound to UI navigation/dialog dependencies.
 */
export function useGlobalSearchActionService(): GlobalSearchActionService {
  const router = useRouter();
  const { openContactsDialog } = useContactsDialog();
  const { openCompaniesDialog } = useCompaniesDialog();

  return new GlobalSearchActionService({
    router,
    openContactsDialog,
    openCompaniesDialog,
  });
}
