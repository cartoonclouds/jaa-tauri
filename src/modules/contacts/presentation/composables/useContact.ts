import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type {
  ContactCreatePayload,
  ContactUpdatePayload,
} from "@modules/contacts/repositories/ContactRepository";

import { useContactService } from "@modules/contacts";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates contact composable.
 */
function createContactComposable() {
  const service = useContactService();
  return createCrudComposable<
    Contact,
    ContactCreatePayload,
    ContactUpdatePayload
  >(service);
}

/**
 * Type alias for contact composable.
 */
type ContactComposable = ReturnType<typeof createContactComposable>;

let contactComposableInstance: ContactComposable | null = null;

/**
 * Create CRUD state and handlers for contacts.
 */
export function useContact() {
  contactComposableInstance ??= createContactComposable();

  return contactComposableInstance;
}








