import type {
  IStatisticMetricDefinition,
  StatisticCardMetricDefinition,
} from "../entities/Statistic";
import type { IExecutable } from "../types/executable";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toTrendPercentLabel,
  toTrendPointLabel,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";

/** Total applications with applied date in the last 30 days. */
export class ApplicationsAppliedLast30Days implements IExecutable<number> {
  public static id = "applicationsAppliedLast30Days";

  private static readonly METRIC_DEFINITION: IStatisticMetricDefinition = {
    id: "applicationsAppliedLast30Days",
    aggregateSql:
      "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END)",
    card: {
      title: "Applied last 30 days",
      description: "Applications with applied date in the last 30 days",
      icon: "heroicons:calendar",
      tone: "info",
      trendLabel: "vs previous 30 days",
      trendValueField: "applicationsAppliedDeltaPercent",
      trendToneField: "applicationsAppliedDelta30Days",
      trendValueFormat: "percent",
    },
  };

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      `SELECT
${ApplicationsAppliedLast30Days.METRIC_DEFINITION.aggregateSql} AS ${ApplicationsAppliedLast30Days.METRIC_DEFINITION.id}
FROM applications
WHERE deleted_at IS NULL`,
    );

    console.error("Query result rows", rows);

    const result = toFiniteNumber(
      rows[0]?.[ApplicationsAppliedLast30Days.METRIC_DEFINITION.id],
      0,
    );

    this.value = result;

    return result;
  }

  private get trendValue(): string | undefined {
    if (
      typeof this.value !== "number" ||
      ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.trendValueFormat ===
        undefined
    ) {
      return undefined;
    }

    if (
      ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.trendValueFormat ===
      "points"
    ) {
      return toTrendPointLabel(this.value);
    }

    return toTrendPercentLabel(this.value);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsAppliedLast30Days.METRIC_DEFINITION.id,
      title: ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.title,
      description:
        ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.description,
      icon: ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.icon,
      tone: ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.tone,
      value: this.value ?? 0,
      suffix: ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.suffix,
      trendLabel:
        ApplicationsAppliedLast30Days.METRIC_DEFINITION.card.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
