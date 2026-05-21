import type { Contact } from "@modules/contacts/domain/entities/Contact";

import { useContactService } from "@modules/contacts/services/useContactService";

import { useServerDatatable } from "@/composables/useServerDatatable";

export function useContactDatatable() {
  const service = useContactService();

  return useServerDatatable<Contact>({
    fetchPage: (query) => service.listPage(query),
  });
}
