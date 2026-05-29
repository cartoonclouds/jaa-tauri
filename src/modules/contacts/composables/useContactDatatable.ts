import type { Contact } from "@modules/contacts/domain/entities/Contact";

import { useContact } from "@modules/contacts";
import {
  CONTACT_SEARCH_FIELDS,
  type ContactSearchField,
} from "@modules/contacts/constants";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for contacts.
 */
export function useContactDatatable() {
  const { service } = useContact();

  return useServerDatatable<Contact, ContactSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...CONTACT_SEARCH_FIELDS],
  });
}
