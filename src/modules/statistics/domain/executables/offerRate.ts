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
  OFFER_STAGE_PREDICATE_SQL,
  PREVIOUS_30_DAYS_APPLIED_SQL,
} from "./statisticSql";

/** Percentage of applied applications currently in offer stage. */
export class OfferRate implements IMetric {
  public static readonly id = "offerRate";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS offers,
SUM(CASE WHEN applied_at IS NOT NULL THEN 1 ELSE 0 END) AS applied,
SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} AND ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS offers_last_30,
SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} THEN 1 ELSE 0 END) AS applied_last_30,
SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} AND ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS offers_previous_30,
SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} THEN 1 ELSE 0 END) AS applied_previous_30
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Offer rate",
    description: "Offers as a share of applied applications",
    icon: "heroicons:hand-thumb-up",
    tone: "success",
    suffix: "%",
    trendLabel: "vs previous 30-day offer rate",
    trendValueField: "offerRateDeltaPercent",
    trendToneField: "offerRateDeltaPercent",
    trendValueFormat: "points",
  } as const;

  private value: number | null = null;

  private trendDelta: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      OfferRate.QUERY,
    );

    const offers = toFiniteNumber(rows[0]?.offers, 0);
    const applied = toFiniteNumber(rows[0]?.applied, 0);
    const offersLast30 = toFiniteNumber(rows[0]?.offers_last_30, 0);
    const appliedLast30 = toFiniteNumber(rows[0]?.applied_last_30, 0);
    const offersPrevious30 = toFiniteNumber(rows[0]?.offers_previous_30, 0);
    const appliedPrevious30 = toFiniteNumber(rows[0]?.applied_previous_30, 0);

    const result = toRate(offers, applied);
    const currentRate = toRate(offersLast30, appliedLast30);
    const previousRate = toRate(offersPrevious30, appliedPrevious30);

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
      id: OfferRate.id,
      title: OfferRate.CARD_DEFINITION.title,
      description: OfferRate.CARD_DEFINITION.description,
      icon: OfferRate.CARD_DEFINITION.icon,
      tone: OfferRate.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      suffix: OfferRate.CARD_DEFINITION.suffix,
      trendLabel: OfferRate.CARD_DEFINITION.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.trendDelta ?? 0),
    };
  }
}
