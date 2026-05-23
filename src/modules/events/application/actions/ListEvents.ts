import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";

import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export async function listEvents(db: DatabaseDriver): Promise<Event[]> {
  const rows = await db.select<Record<string, unknown>>(
    buildSelectAllOrderedQuery({
      tableName: "events",
      orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
    }),
  );

  return rows.map((row) => mapEventRowToEntity(row));
}
