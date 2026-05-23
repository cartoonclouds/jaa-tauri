import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  DocumentCreatePayload,
  DocumentUpdatePayload,
} from "@modules/documents/repositories/DocumentRepository";

import { useDocumentService } from "@modules/documents";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates document composable.
 */
function createDocumentComposable() {
  const service = useDocumentService();
  return createCrudComposable<
    Document,
    DocumentCreatePayload,
    DocumentUpdatePayload
  >(service);
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








