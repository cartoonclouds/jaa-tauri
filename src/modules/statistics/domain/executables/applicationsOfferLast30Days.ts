import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";
import {
  LAST_30_DAYS_APPLIED_SQL,
  OFFER_STAGE_PREDICATE_SQL,
} from "./statisticSql";

/** Last-30-day applications currently in offer stage. */
export class ApplicationsOfferLast30Days implements IExecutable {
  public static readonly id = "applicationsOfferLast30Days";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} AND ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS ${ApplicationsOfferLast30Days.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Offers last 30 days",
    description: "Last-30-day applied cohorts in offer stage",
    icon: "heroicons:hand-thumb-up",
    tone: "default",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsOfferLast30Days.QUERY,
    );

    const result = toFiniteNumber(rows[0]?.[ApplicationsOfferLast30Days.id], 0);

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsOfferLast30Days.id,
      title: ApplicationsOfferLast30Days.CARD_DEFINITION.title,
      description: ApplicationsOfferLast30Days.CARD_DEFINITION.description,
      icon: ApplicationsOfferLast30Days.CARD_DEFINITION.icon,
      tone: ApplicationsOfferLast30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
