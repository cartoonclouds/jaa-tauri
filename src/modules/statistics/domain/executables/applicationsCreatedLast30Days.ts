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

/** Total applications created in the last 30 days. */
export class ApplicationsCreatedLast30Days implements IExecutable<number> {
  public static id = "applicationsCreatedLast30Days";

  private static readonly METRIC_DEFINITION: IStatisticMetricDefinition = {
    id: "applicationsCreatedLast30Days",
    aggregateSql:
      "SUM(CASE WHEN datetime(created_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END)",
    card: {
      title: "Created last 30 days",
      description: "New opportunities added this month",
      icon: "heroicons:calendar-days",
      tone: "info",
      trendLabel: "vs previous 30 days",
      trendValueField: "applicationsCreatedDeltaPercent",
      trendToneField: "applicationsCreatedDelta30Days",
      trendValueFormat: "percent",
    },
  };

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      `SELECT
${ApplicationsCreatedLast30Days.METRIC_DEFINITION.aggregateSql} AS ${ApplicationsCreatedLast30Days.METRIC_DEFINITION.id}
FROM applications
WHERE deleted_at IS NULL`,
    );

    console.error("Query result rows", rows);

    const result = toFiniteNumber(
      rows[0]?.[ApplicationsCreatedLast30Days.METRIC_DEFINITION.id],
      0,
    );

    this.value = result;

    return result;
  }

  private get trendValue(): string | undefined {
    if (
      typeof this.value !== "number" ||
      ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.trendValueFormat ===
        undefined
    ) {
      return undefined;
    }

    if (
      ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.trendValueFormat ===
      "points"
    ) {
      return toTrendPointLabel(this.value);
    }

    return toTrendPercentLabel(this.value);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsCreatedLast30Days.METRIC_DEFINITION.id,
      title: ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.title,
      description:
        ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.description,
      icon: ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.icon,
      tone: ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.tone,
      value: this.value ?? 0,
      suffix: ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.suffix,
      trendLabel:
        ApplicationsCreatedLast30Days.METRIC_DEFINITION.card.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
