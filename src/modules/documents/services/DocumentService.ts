import type { DatatablePageQuery } from "@shared/types";

import { DocumentSchema } from "@modules/documents/domain/zod/document.schema";
import {
  type ApplicationLinkedDocument,
  type DocumentCreatePayload,
  type DocumentUpdatePayload,
  type IDocumentRepository,
} from "@modules/documents/repositories/DocumentRepository";

/**
 * Implements document service.
 */
export class DocumentService {
  constructor(private readonly repository: IDocumentRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedDocument[]> {
    return this.repository.listByApplicationId(applicationId);
  }

  linkToApplication(
    applicationId: string,
    documentId: string,
    relationType = "attachment",
  ): Promise<void> {
    return this.repository.linkToApplication(
      applicationId,
      documentId,
      relationType,
    );
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
