import { ContactRepository } from "@modules/contacts/repositories/ContactRepository";
import { ContactService } from "@modules/contacts/services/ContactService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create a contact service instance backed by the injected database driver.
 */
export function useContactService(): ContactService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new ContactService(new ContactRepository(database));
}
