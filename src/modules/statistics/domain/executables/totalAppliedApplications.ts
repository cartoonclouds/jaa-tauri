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

/** Total applications currently tracked (excluding deleted rows). */
export class TotalAppliedApplications implements IExecutable<number> {
  public static id = "totalAppliedApplications";

  private static readonly METRIC_DEFINITION: IStatisticMetricDefinition = {
    id: "totalAppliedApplications",
    aggregateSql: "SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END)",
    card: {
      title: "Applied applications",
      description: "Applications currently in applied stage",
      icon: "heroicons:paper-airplane",
      tone: "default",
    },
  };

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      `SELECT
${TotalAppliedApplications.METRIC_DEFINITION.aggregateSql} AS ${TotalAppliedApplications.METRIC_DEFINITION.id}
FROM applications
WHERE deleted_at IS NULL`,
    );

    const result = toFiniteNumber(
      rows[0]?.[TotalAppliedApplications.METRIC_DEFINITION.id],
      0,
    );

    this.value = result;

    return result;
  }

  private get trendValue(): string | undefined {
    if (
      typeof this.value !== "number" ||
      TotalAppliedApplications.METRIC_DEFINITION.card.trendValueFormat ===
        undefined
    ) {
      return undefined;
    }

    if (
      TotalAppliedApplications.METRIC_DEFINITION.card.trendValueFormat ===
      "points"
    ) {
      return toTrendPointLabel(this.value);
    }

    return toTrendPercentLabel(this.value);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: TotalAppliedApplications.METRIC_DEFINITION.id,
      title: TotalAppliedApplications.METRIC_DEFINITION.card.title,
      description: TotalAppliedApplications.METRIC_DEFINITION.card.description,
      icon: TotalAppliedApplications.METRIC_DEFINITION.card.icon,
      tone: TotalAppliedApplications.METRIC_DEFINITION.card.tone,
      value: this.value ?? 0,
      suffix: TotalAppliedApplications.METRIC_DEFINITION.card.suffix,
      trendLabel: TotalAppliedApplications.METRIC_DEFINITION.card.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
