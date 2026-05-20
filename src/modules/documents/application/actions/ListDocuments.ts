import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Document } from "@modules/documents/domain/entities/Document";

import { mapDocumentRowToEntity } from "@modules/documents/application/mappers/mapDocumentRow";

export async function listDocuments(db: DatabaseDriver): Promise<Document[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM documents ORDER BY created_at DESC",
  );

  return rows.map((row) => mapDocumentRowToEntity(row));
}
