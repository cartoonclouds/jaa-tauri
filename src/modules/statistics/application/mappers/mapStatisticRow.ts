import type { Statistic } from "@/modules/statistics/domain/types/Statistic";

import {
  StatisticSchema,
  type StatisticScopeValue,
} from "@modules/statistics/domain/zod/statistic.schema";
import {
  mapAuditTimestamps,
  mapOptionalRowDate,
  normalizeLiteralValue,
  toFiniteNumber,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

const STATISTIC_SCOPE_VALUES = ["global", "company", "application"] as const;

/** Maps raw DB scope values to the supported statistics scope enum. */
function toScope(value: unknown): StatisticScopeValue {
  return normalizeLiteralValue(value, STATISTIC_SCOPE_VALUES, "global");
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
    id: toRequiredString(row.id),
    name: toRequiredString(row.name),
    value: toFiniteNumber(row.value, Number.NaN),
    scope: toScope(row.scope),
    recordedAt: mapOptionalRowDate(row.recorded_at),
    ...timestamps,
  });
}
