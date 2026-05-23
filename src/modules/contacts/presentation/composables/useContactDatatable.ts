import type { Contact } from "@modules/contacts/domain/entities/Contact";

import {
  CONTACT_SEARCH_FIELDS,
  type ContactSearchField,
} from "@modules/contacts/constants/contactDatatableFields";
import { useContactService } from "@modules/contacts/services/useContactService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for contacts.
 */
export function useContactDatatable() {
  const service = useContactService();

  return useServerDatatable<Contact, ContactSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...CONTACT_SEARCH_FIELDS],
  });
}
