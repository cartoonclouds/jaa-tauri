import type { Document } from "@modules/documents/domain/entities/Document";

import { useDocumentService } from "@modules/documents";
import {
  DOCUMENT_SEARCH_FIELDS,
  type DocumentSearchField,
} from "@modules/documents/constants/documentDatatableFields";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for documents.
 */
export function useDocumentDatatable() {
  const service = useDocumentService();

  return useServerDatatable<Document, DocumentSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...DOCUMENT_SEARCH_FIELDS],
  });
}



