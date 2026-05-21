import { DocumentRepository } from "@modules/documents/repositories/DocumentRepository";
import { DocumentService } from "@modules/documents/services/DocumentService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create a document service instance backed by the injected database driver.
 */
export function useDocumentService(): DocumentService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new DocumentService(new DocumentRepository(database));
}
