import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  EntityCreatePayload,
  IRepository,
  PartialUpdatePayload,
} from "@shared/types";

import { mapDocumentRowToEntity } from "@modules/documents/application/mappers/mapDocumentRow";
import { DOCUMENT_SEARCH_FIELDS } from "@modules/documents/constants";
import { DocumentRepositoryCreateSchema } from "@modules/documents/domain/zod/document.schema";
import { ValidationError } from "@shared/domain/errors";
import { toRequiredString } from "@shared/utils/database-mapping/stringValueUtils";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

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
 * Defines idocument repository.
 */
export interface IDocumentRepository extends IRepository<
  Document,
  DocumentCreatePayload,
  DocumentUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Document>>;
  listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedDocument[]>;
  linkToApplication(
    applicationId: string,
    documentId: string,
    relationType?: string,
  ): Promise<void>;
}

/**
 * Implements document repository.
 */
export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Document[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "documents",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );
    return rows.map((row) => mapDocumentRowToEntity(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Document>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      DOCUMENT_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM documents
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM documents",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM documents
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM documents
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapDocumentRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: DocumentCreatePayload): Promise<string> {
    const parseResult = DocumentRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new ValidationError(
        "Document title, kind, and file path are required",
      );
    }

    const title = parseResult.data.title.trim();
    const kind = parseResult.data.kind.trim();
    const filePath = parseResult.data.filePath.trim();
    if (!title || !kind || !filePath) {
      throw new ValidationError(
        "Document title, kind, and file path are required",
      );
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO documents (id, title, kind, file_path, mime_type, size_bytes, checksum, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        title,
        kind,
        filePath,
        payload.mimeType ?? null,
        payload.sizeBytes ?? null,
        payload.checksum ?? null,
      ],
    );
    return id;
  }

  async listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedDocument[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         d.*,
         ad.relation_type
       FROM application_documents ad
       INNER JOIN documents d ON d.id = ad.document_id
       WHERE ad.application_id = $1
       ORDER BY ad.created_at DESC`,
      [applicationId],
    );

    return rows.map((row) => ({
      document: mapDocumentRowToEntity(row),
      relationType: toRequiredString(row.relation_type ?? "attachment"),
    }));
  }

  async linkToApplication(
    applicationId: string,
    documentId: string,
    relationType = "attachment",
  ): Promise<void> {
    await this.db.execute(
      `INSERT OR IGNORE INTO application_documents (application_id, document_id, relation_type)
       VALUES ($1, $2, $3)`,
      [applicationId, documentId, relationType],
    );
  }

  async update(payload: DocumentUpdatePayload): Promise<void> {
    await this.db.execute(
      `UPDATE documents
       SET title = COALESCE($1, title),
           kind = COALESCE($2, kind),
           file_path = COALESCE($3, file_path),
           mime_type = COALESCE($4, mime_type),
           size_bytes = COALESCE($5, size_bytes),
           checksum = COALESCE($6, checksum),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        payload.title ?? null,
        payload.kind ?? null,
        payload.filePath ?? null,
        payload.mimeType ?? null,
        payload.sizeBytes ?? null,
        payload.checksum ?? null,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM documents WHERE id = $1", [id]);
  }
}
