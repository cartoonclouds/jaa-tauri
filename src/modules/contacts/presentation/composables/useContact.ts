import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type {
  ContactCreatePayload,
  ContactUpdatePayload,
} from "@modules/contacts/repositories/ContactRepository";

import { useContactService } from "@modules/contacts/services/useContactService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for contacts.
 */
export function useContact() {
  const service = useContactService();
  return createCrudComposable<
    Contact,
    ContactCreatePayload,
    ContactUpdatePayload
  >(service);
}
