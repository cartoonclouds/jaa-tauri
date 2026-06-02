import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../entities/Statistic";
import type { IExecutable } from "../types/executable";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toRate,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";
import { REJECTED_STAGE_PREDICATE_SQL } from "./statisticSql";

/** Percentage of applied applications currently in rejected stage. */
export class RejectionRate implements IExecutable<number> {
  public static id = "rejectionRate";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${REJECTED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS rejected,
    SUM(CASE WHEN applied_at IS NOT NULL THEN 1 ELSE 0 END) AS applied
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Rejection rate",
    description: "Rejections as a share of applied applications",
    icon: "heroicons:chart-bar",
    tone: "danger",
    suffix: "%",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      RejectionRate.QUERY,
    );

    const rejected = toFiniteNumber(rows[0]?.rejected, 0);
    const applied = toFiniteNumber(rows[0]?.applied, 0);

    const result = toRate(rejected, applied);
    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: RejectionRate.id,
      title: RejectionRate.CARD_DEFINITION.title,
      description: RejectionRate.CARD_DEFINITION.description,
      icon: RejectionRate.CARD_DEFINITION.icon,
      tone: RejectionRate.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      suffix: RejectionRate.CARD_DEFINITION.suffix,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
