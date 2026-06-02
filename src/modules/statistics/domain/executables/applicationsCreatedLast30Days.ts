import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toTrendPercent,
  toTrendPercentLabel,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";

/** Total applications created in the last 30 days. */
export class ApplicationsCreatedLast30Days implements IExecutable<number> {
  public static readonly id = "applicationsCreatedLast30Days";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN datetime(created_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END) AS ${ApplicationsCreatedLast30Days.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Created last 30 days",
    description: "New opportunities added this month",
    icon: "heroicons:calendar-days",
    tone: "info",
    trendLabel: "vs previous 30 days",
    trendValueField: "applicationsCreatedDeltaPercent",
    trendToneField: "applicationsCreatedDelta30Days",
    trendValueFormat: "percent",
  } as const;

  private value: number | null = null;

  private trendPercent: number | null = null;

  private trendDelta: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsCreatedLast30Days.QUERY,
    );

    const current = toFiniteNumber(
      rows[0]?.[ApplicationsCreatedLast30Days.id],
      0,
    );
    const previous = toFiniteNumber(
      rows[0]?.applicationsCreatedPrevious30Days,
      0,
    );

    this.value = current;
    this.trendDelta = current - previous;
    this.trendPercent = toTrendPercent(current, previous);

    return current;
  }

  private get trendValue(): string | undefined {
    if (typeof this.trendPercent !== "number") {
      return undefined;
    }

    return toTrendPercentLabel(this.trendPercent);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsCreatedLast30Days.id,
      title: ApplicationsCreatedLast30Days.CARD_DEFINITION.title,
      description: ApplicationsCreatedLast30Days.CARD_DEFINITION.description,
      icon: ApplicationsCreatedLast30Days.CARD_DEFINITION.icon,
      tone: ApplicationsCreatedLast30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendLabel: ApplicationsCreatedLast30Days.CARD_DEFINITION.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.trendDelta ?? 0),
    };
  }
}
