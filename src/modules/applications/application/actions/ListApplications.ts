import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Application } from "@modules/applications/domain/entities/Application";

import { mapApplicationRowToEntity } from "@modules/applications/application/mappers/mapApplicationRow";

export async function listApplications(
  db: DatabaseDriver,
): Promise<Application[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM applications WHERE is_deleted = 0 ORDER BY created_at DESC",
  );

  return rows.map((row) => mapApplicationRowToEntity(row));
}
