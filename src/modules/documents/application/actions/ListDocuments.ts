import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Document } from "@modules/documents/domain/entities/Document";

export async function listDocuments(db: DatabaseDriver): Promise<Document[]> {
  const rows = await db.select<Record<string, unknown>>(
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
