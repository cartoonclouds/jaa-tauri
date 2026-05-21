import type { Document } from "@modules/documents/domain/entities/Document";

import { useDocumentService } from "@modules/documents/services/useDocumentService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for documents.
 */
export function useDocumentDatatable() {
  const service = useDocumentService();

  return useServerDatatable<Document>({
    fetchPage: (query) => service.listPage(query),
  });
}
