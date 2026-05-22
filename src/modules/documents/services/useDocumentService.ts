import { DocumentRepository } from "@modules/documents/repositories/DocumentRepository";
import { DocumentService } from "@modules/documents/services/DocumentService";
import { useNuxtApp } from "nuxt/app";

let documentServiceInstance: DocumentService | null = null;

/**
 * Create a document service instance backed by the injected database driver.
 */
export function useDocumentService(): DocumentService {
  if (!documentServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    documentServiceInstance = new DocumentService(
      new DocumentRepository(database),
    );
  }

  return documentServiceInstance;
}
