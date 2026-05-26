import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import {
  StatisticSchema,
  type StatisticScopeValue,
} from "@modules/statistics/domain/zod/statistic.schema";
import {
  mapAuditTimestamps,
  mapOptionalRowDate,
} from "@shared/utils/rowDateUtils";

/** Maps raw DB scope values to the supported statistics scope enum. */
function toScope(value: unknown): StatisticScopeValue {
  return value === "company" || value === "application" ? value : "global";
}

/**
 * Map a raw database row into a validated statistic entity.
 */
export function mapStatisticRowToEntity(
  row: Record<string, unknown>,
): Statistic {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return StatisticSchema.parse({
    id: String(row.id),
    name: String(row.name),
    value: Number(row.value),
    scope: toScope(row.scope),
    recordedAt: mapOptionalRowDate(row.recorded_at),
    ...timestamps,
  });
}
