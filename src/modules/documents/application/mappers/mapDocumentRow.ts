import type { Document } from "@modules/documents/domain/entities/Document";

export function mapDocumentRowToEntity(row: Record<string, unknown>): Document {
  return {
    id: String(row.id),
    title: String(row.title),
    kind: String(row.kind),
    filePath: String(row.file_path),
    mimeType: (row.mime_type as string | null) ?? null,
    sizeBytes: (row.size_bytes as number | null) ?? null,
    checksum: (row.checksum as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
