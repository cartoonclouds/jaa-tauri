import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/Statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toTrendPercent,
  toTrendPercentLabel,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";

/** Total applications with applied date in the last 30 days. */
export class ApplicationsAppliedLast30Days implements IExecutable<number> {
  public static readonly id = "applicationsAppliedLast30Days" as const;

  public static readonly QUERY = `SELECT
SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END) AS ${ApplicationsAppliedLast30Days.id},
SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END) AS applicationsAppliedPrevious30Days
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Applied last 30 days",
    description: "Applications with applied date in the last 30 days",
    icon: "heroicons:calendar",
    tone: "info",
    trendLabel: "vs previous 30 days",
    trendValueField: "applicationsAppliedDeltaPercent",
    trendToneField: "applicationsAppliedDelta30Days",
    trendValueFormat: "percent",
  } as const;

  private value: number | null = null;

  private trendPercent: number | null = null;

  private trendDelta: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsAppliedLast30Days.QUERY,
    );

    const current = toFiniteNumber(
      rows[0]?.[ApplicationsAppliedLast30Days.id],
      0,
    );
    const previous = toFiniteNumber(
      rows[0]?.applicationsAppliedPrevious30Days,
      0,
    );

    this.value = current;
    this.trendDelta = current - previous;
    this.trendPercent = toTrendPercent(current, previous);

    return current;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsAppliedLast30Days.id,
      title: ApplicationsAppliedLast30Days.CARD_DEFINITION.title,
      description: ApplicationsAppliedLast30Days.CARD_DEFINITION.description,
      icon: ApplicationsAppliedLast30Days.CARD_DEFINITION.icon,
      tone: ApplicationsAppliedLast30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendLabel: ApplicationsAppliedLast30Days.CARD_DEFINITION.trendLabel,
      trendValue: toTrendPercentLabel(this.trendPercent ?? 0),
      trendTone: toTrendTone(this.trendDelta ?? 0),
    };
  }
}
