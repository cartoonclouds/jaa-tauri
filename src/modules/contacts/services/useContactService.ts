import { ContactRepository } from "@modules/contacts/repositories/ContactRepository";
import { ContactService } from "@modules/contacts/services/ContactService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let contactServiceInstance: ContactService | null = null;

/**
 * Create a contact service instance backed by the injected database driver.
 */
export function useContactService(): ContactService {
  if (!contactServiceInstance) {
    const database = getNuxtDatabase();
    contactServiceInstance = new ContactService(
      new ContactRepository(database),
    );
  }

  return contactServiceInstance;
}



