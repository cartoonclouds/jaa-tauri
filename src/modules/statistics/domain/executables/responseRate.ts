import type { IMetric } from "../types/metric";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toRate,
  toTrendPointLabel,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";
import {
  LAST_30_DAYS_APPLIED_SQL,
  PREVIOUS_30_DAYS_APPLIED_SQL,
  RESPONDED_STAGE_PREDICATE_SQL,
} from "./statisticSql";

/** Percentage of applied applications that advanced to response stages. */
export class ResponseRate implements IMetric {
  public static readonly id = "responseRate";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS responded,
SUM(CASE WHEN applied_at IS NOT NULL THEN 1 ELSE 0 END) AS applied,
SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} AND ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS responded_last_30,
SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} THEN 1 ELSE 0 END) AS applied_last_30,
SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} AND ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS responded_previous_30,
SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} THEN 1 ELSE 0 END) AS applied_previous_30
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Response rate",
    description: "Interview or final outcome after applying",
    icon: "heroicons:presentation-chart-line",
    tone: "success",
    suffix: "%",
    trendLabel: "vs previous 30-day response rate",
    trendValueField: "responseRateDeltaPercent",
    trendToneField: "responseRateDeltaPercent",
    trendValueFormat: "points",
  } as const;

  private value: number | null = null;

  private trendDelta: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ResponseRate.QUERY,
    );

    const responded = toFiniteNumber(rows[0]?.responded, 0);
    const applied = toFiniteNumber(rows[0]?.applied, 0);
    const respondedLast30 = toFiniteNumber(rows[0]?.responded_last_30, 0);
    const appliedLast30 = toFiniteNumber(rows[0]?.applied_last_30, 0);
    const respondedPrevious30 = toFiniteNumber(
      rows[0]?.responded_previous_30,
      0,
    );
    const appliedPrevious30 = toFiniteNumber(rows[0]?.applied_previous_30, 0);

    const result = toRate(responded, applied);
    const currentRate = toRate(respondedLast30, appliedLast30);
    const previousRate = toRate(respondedPrevious30, appliedPrevious30);

    this.value = result;
    this.trendDelta = currentRate - previousRate;

    return result;
  }

  private get trendValue(): string | undefined {
    if (typeof this.trendDelta !== "number") {
      return undefined;
    }

    return toTrendPointLabel(this.trendDelta);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ResponseRate.id,
      title: ResponseRate.CARD_DEFINITION.title,
      description: ResponseRate.CARD_DEFINITION.description,
      icon: ResponseRate.CARD_DEFINITION.icon,
      tone: ResponseRate.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      suffix: ResponseRate.CARD_DEFINITION.suffix,
      trendLabel: ResponseRate.CARD_DEFINITION.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.trendDelta ?? 0),
    };
  }
}
