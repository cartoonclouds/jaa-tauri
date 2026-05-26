import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  DocumentCreatePayload,
  DocumentUpdatePayload,
} from "@modules/documents/repositories/DocumentRepository";

import { DocumentRepository } from "@modules/documents/repositories/DocumentRepository";
import { DocumentService } from "@modules/documents/services/DocumentService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createDocumentService(): DocumentService {
  const database = getNuxtDatabase();
  return new DocumentService(new DocumentRepository(database));
}

let documentServiceInstance: DocumentService | null = null;

function getDocumentService(): DocumentService {
  documentServiceInstance ??= createDocumentService();

  return documentServiceInstance;
}

/**
 * Creates document composable.
 */
function createDocumentComposable() {
  const service = getDocumentService();
  const crudComposable = createCrudComposable<
    Document,
    DocumentCreatePayload,
    DocumentUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
}

/**
 * Type alias for document composable.
 */
type DocumentComposable = ReturnType<typeof createDocumentComposable>;

let documentComposableInstance: DocumentComposable | null = null;

/**
 * Create CRUD state and handlers for documents.
 */
export function useDocument() {
  documentComposableInstance ??= createDocumentComposable();

  return documentComposableInstance;
}
