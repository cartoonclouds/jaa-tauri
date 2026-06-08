import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  EntityCreatePayload,
  IPaginatedRepository,
  IRepository,
  PartialUpdatePayload,
} from "@shared/types";

/**
 * Type alias for document create payload.
 */
export type DocumentCreatePayload = EntityCreatePayload<
  Document,
  "title" | "kind" | "filePath" | "mimeType" | "sizeBytes" | "checksum"
>;

/**
 * Type alias for document update payload.
 */
export type DocumentUpdatePayload = PartialUpdatePayload<DocumentCreatePayload>;

/**
 * Linked document entry for a specific application.
 */
export interface ApplicationLinkedDocument {
  document: Document;
  relationType: string;
}

/**
 * Defines document repository contract.
 */
export interface IDocumentRepository
  extends
    IRepository<Document, DocumentCreatePayload, DocumentUpdatePayload>,
    IPaginatedRepository<Document> {
  listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedDocument[]>;
  linkToApplication(
    applicationId: string,
    documentId: string,
    relationType?: string,
  ): Promise<void>;
}
