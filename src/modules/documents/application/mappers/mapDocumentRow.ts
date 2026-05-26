import type { Document } from "@modules/documents/domain/entities/Document";

import {
  mapAuditTimestamps,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

/**
 * Map a raw database row into a typed document entity.
 */
export function mapDocumentRowToEntity(row: Record<string, unknown>): Document {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    title: toRequiredString(row.title),
    kind: toRequiredString(row.kind),
    filePath: toRequiredString(row.file_path),
    mimeType: toNullableString(row.mime_type),
    sizeBytes: (row.size_bytes as number | null) ?? null,
    checksum: toNullableString(row.checksum),
    ...timestamps,
  };
}
