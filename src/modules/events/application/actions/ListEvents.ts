import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";

import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";

export async function listEvents(db: DatabaseDriver): Promise<Event[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM events ORDER BY created_at DESC",
  );

  return rows.map((row) => mapEventRowToEntity(row));
}
