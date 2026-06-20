import type { Insight } from "@modules/insights/domain/types/insight";

import {
  InsightSchema,
  type InsightScopeValue,
} from "@modules/insights/domain/zod/insight.schema";
import {
  mapAuditTimestamps,
  mapOptionalRowDate,
  normalizeLiteralValue,
  toFiniteNumber,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

const INSIGHT_SCOPE_VALUES = ["global", "company", "application"] as const;

/** Maps raw DB scope values to the supported insights scope enum. */
function toScope(value: unknown): InsightScopeValue {
  return normalizeLiteralValue(value, INSIGHT_SCOPE_VALUES, "global");
}

/**
 * Map a raw database row into a validated insight entity.
 */
export function mapInsightRowToEntity(row: Record<string, unknown>): Insight {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  try {
    return InsightSchema.parse({
      id: toRequiredString(row.id),
      name: toRequiredString(row.name),
      value: toFiniteNumber(row.value, Number.NaN),
      scope: toScope(row.scope),
      recordedAt: mapOptionalRowDate(row.recorded_at),
      ...timestamps,
    });
  } catch (error) {
    console.error("mapInsightRowToEntity validation failed", { row, error });
    throw error;
  }
}


