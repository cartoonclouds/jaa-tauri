import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type {
  ContactCreatePayload,
  ContactUpdatePayload,
} from "@modules/contacts/repositories/ContactRepository";

import { ContactRepository } from "@modules/contacts/repositories/ContactRepository";
import { ContactService } from "@modules/contacts/services/ContactService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createContactService(): ContactService {
  const database = getNuxtDatabase();
  return new ContactService(new ContactRepository(database));
}

let contactServiceInstance: ContactService | null = null;

function getContactService(): ContactService {
  contactServiceInstance ??= createContactService();

  return contactServiceInstance;
}

/**
 * Creates contact composable.
 */
function createContactComposable() {
  const service = getContactService();
  const crudComposable = createCrudComposable<
    Contact,
    ContactCreatePayload,
    ContactUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
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
