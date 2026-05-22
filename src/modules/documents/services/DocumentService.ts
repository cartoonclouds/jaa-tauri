import type { DatatablePageQuery } from "@shared/types";

import {
  type DocumentCreatePayload,
  type DocumentUpdatePayload,
  type IDocumentRepository,
} from "@modules/documents/repositories/DocumentRepository";
import { DocumentSchema } from "@modules/documents/domain/zod/document.schema";

export class DocumentService {
  constructor(private readonly repository: IDocumentRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  create(payload: DocumentCreatePayload) {
    const result = DocumentSchema.pick({
      title: true,
      kind: true,
      filePath: true,
      mimeType: true,
    }).safeParse(payload);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return this.repository.create(payload);
  }

  update(payload: DocumentUpdatePayload) {
    if (payload.title !== undefined || payload.filePath !== undefined) {
      const validatePayload = {
        title: payload.title,
        filePath: payload.filePath,
      };
      const result = DocumentSchema.pick({ title: true, filePath: true })
        .partial()
        .safeParse(validatePayload);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }
    }

    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
