import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import { mapStatisticRowToEntity } from "@modules/statistics/application/mappers/mapStatisticRow";
import { StatisticSchema } from "@modules/statistics/domain/zod/statistic.schema";

/**
 * Fetch all statistics ordered by creation date descending.
 */
export async function listStatistics(db: DatabaseDriver): Promise<Statistic[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM statistics ORDER BY created_at DESC",
  );

  const mapped = rows.map((row) => mapStatisticRowToEntity(row));
  return StatisticSchema.array().parse(mapped);
}
