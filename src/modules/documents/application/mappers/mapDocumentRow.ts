import type { Document } from "@modules/documents/domain/entities/Document";

import { toDate } from "@shared/utils/toDate";

/**
 * Map a raw database row into a typed document entity.
 */
export function mapDocumentRowToEntity(row: Record<string, unknown>): Document {
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
