import type { DatatablePageQuery } from "@shared/types";

import { DocumentSchema } from "@modules/documents/domain/zod/document.schema";
import {
  type ApplicationLinkedDocument,
  type DocumentCreatePayload,
  type DocumentUpdatePayload,
  type IDocumentRepository,
} from "@modules/documents/repositories/DocumentRepository";
import { parseWithSchema } from "@shared/utils/zodValidation";

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
    parseWithSchema(
      DocumentSchema.pick({
        title: true,
        kind: true,
        filePath: true,
        mimeType: true,
      }),
      payload,
    );

    return this.repository.create(payload);
  }

  update(payload: DocumentUpdatePayload) {
    if (payload.title !== undefined || payload.filePath !== undefined) {
      const validatePayload = {
        title: payload.title,
        filePath: payload.filePath,
      };
      parseWithSchema(
        DocumentSchema.pick({ title: true, filePath: true }).partial(),
        validatePayload,
      );
    }

    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
