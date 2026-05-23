import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Document } from "@modules/documents/domain/entities/Document";

import { mapDocumentRowToEntity } from "@modules/documents/application/mappers/mapDocumentRow";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export async function listDocuments(db: DatabaseDriver): Promise<Document[]> {
  const rows = await db.select<Record<string, unknown>>(
    buildSelectAllOrderedQuery({
      tableName: "documents",
      orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
    }),
  );

  return rows.map((row) => mapDocumentRowToEntity(row));
}
