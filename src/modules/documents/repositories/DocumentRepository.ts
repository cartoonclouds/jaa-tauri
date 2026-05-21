import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Document } from "@modules/documents/domain/entities/Document";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { toDate } from "@shared/utils/toDate";

export type DocumentCreatePayload = Pick<
  Document,
  "title" | "kind" | "filePath" | "mimeType" | "sizeBytes" | "checksum"
>;
export type DocumentUpdatePayload = Partial<DocumentCreatePayload> & {
  id: string;
};

export interface IDocumentRepository extends IRepository<
  Document,
  DocumentCreatePayload,
  DocumentUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Document>>;
}

export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private mapDocumentRow(row: Record<string, unknown>): Document {
    return {
      id: String(row.id),
      title: String(row.title),
      kind: String(row.kind),
      filePath: String(row.file_path),
      mimeType: (row.mime_type as string | null) ?? null,
      sizeBytes: (row.size_bytes as number | null) ?? null,
      checksum: (row.checksum as string | null) ?? null,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    };
  }

  async list(): Promise<Document[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM documents ORDER BY created_at DESC",
    );
    return rows.map((row) => this.mapDocumentRow(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Document>> {
    const rows = Math.max(1, query.rows);
    const page = Math.max(0, query.page);
    const search = query.search?.trim() ?? "";
    const hasSearch = search.length > 0;

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM documents WHERE title LIKE $1 OR kind LIKE $1 OR file_path LIKE $1",
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM documents",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM documents
           WHERE title LIKE $1 OR kind LIKE $1 OR file_path LIKE $1
           ORDER BY created_at DESC
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM documents
           ORDER BY created_at DESC
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => this.mapDocumentRow(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: DocumentCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO documents (id, title, kind, file_path, mime_type, size_bytes, checksum, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        payload.title,
        payload.kind,
        payload.filePath,
        payload.mimeType ?? null,
        payload.sizeBytes ?? null,
        payload.checksum ?? null,
      ],
    );
    return id;
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
