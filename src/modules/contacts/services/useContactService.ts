import { ContactRepository } from "@modules/contacts/repositories/ContactRepository";
import { ContactService } from "@modules/contacts/services/ContactService";
import { useNuxtApp } from "nuxt/app";

let contactServiceInstance: ContactService | null = null;

/**
 * Create a contact service instance backed by the injected database driver.
 */
export function useContactService(): ContactService {
  if (!contactServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    contactServiceInstance = new ContactService(
      new ContactRepository(database),
    );
  }

  return contactServiceInstance;
}
