import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  DocumentCreatePayload,
  DocumentUpdatePayload,
} from "@modules/documents/repositories/DocumentRepository";

import { useDocumentService } from "@modules/documents/services/useDocumentService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for documents.
 */
export function useDocument() {
  const service = useDocumentService();
  return createCrudComposable<
    Document,
    DocumentCreatePayload,
    DocumentUpdatePayload
  >(service);
}
