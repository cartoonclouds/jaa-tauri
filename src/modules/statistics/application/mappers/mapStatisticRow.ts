import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import {
  StatisticSchema,
  type StatisticScopeValue,
} from "@modules/statistics/domain/zod/statistic.schema";
import { toDate, toNullableDate } from "@shared/utils/toDate";

/**
 * Handles to scope.
 */
function toScope(value: unknown): StatisticScopeValue {
  return value === "company" || value === "application" ? value : "global";
}

/**
 * Map a raw database row into a validated statistic entity.
 */
export function mapStatisticRowToEntity(
  row: Record<string, unknown>,
): Statistic {
  return StatisticSchema.parse({
    id: String(row.id),
    name: String(row.name),
    value: Number(row.value),
    scope: toScope(row.scope),
    recordedAt: toNullableDate(row.recorded_at),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  });
}








