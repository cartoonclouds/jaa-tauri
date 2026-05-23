import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Application } from "@modules/applications/domain/entities/Application";

import { mapApplicationRowToEntity } from "@modules/applications/application/mappers/mapApplicationRow";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export async function listApplications(
  db: DatabaseDriver,
): Promise<Application[]> {
  const rows = await db.select<Record<string, unknown>>(
    buildSelectAllOrderedQuery({
      tableName: "applications",
      whereClause: "is_deleted = 0",
      orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
    }),
  );

  return rows.map((row) => mapApplicationRowToEntity(row));
}
