import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Document } from "@modules/documents/domain/entities/Document";

export type DocumentCreatePayload = Pick<
  Document,
  "title" | "kind" | "filePath" | "mimeType" | "sizeBytes" | "checksum"
>;
export type DocumentUpdatePayload = Partial<DocumentCreatePayload> & {
  id: string;
};

export class DocumentRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Document[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM documents ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      kind: String(row.kind),
      filePath: String(row.file_path),
      mimeType: (row.mime_type as string | null) ?? null,
      sizeBytes: (row.size_bytes as number | null) ?? null,
      checksum: (row.checksum as string | null) ?? null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
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
