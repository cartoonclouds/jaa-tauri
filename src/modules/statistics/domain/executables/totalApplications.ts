import type { StatisticMetricDefinition } from "../../statisticMetricDefinitions";
import type { StatisticCardMetricDefinition } from "../entities/Statistic";
import type { IExecutable } from "../types/executable";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toTrendPercentLabel,
  toTrendPointLabel,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";

type IStatisticMetricDefinition = Required<
  Pick<StatisticMetricDefinition, "id" | "aggregateSql" | "card">
>;

/** Total applications currently tracked (excluding deleted rows). */
export class TotalApplications implements IExecutable<number> {
  public static id = "totalApplications";

  private static readonly METRIC_DEFINITION: IStatisticMetricDefinition = {
    id: "totalApplications",
    aggregateSql: "COUNT(*)",
    card: {
      title: "Total applications",
      description: "All active records in your tracker",
      icon: "heroicons:briefcase",
      tone: "info",
    },
  };

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      `SELECT
${TotalApplications.METRIC_DEFINITION.aggregateSql} AS ${TotalApplications.METRIC_DEFINITION.id}
FROM applications
WHERE deleted_at IS NULL`,
    );

    const result = toFiniteNumber(
      rows[0]?.[TotalApplications.METRIC_DEFINITION.id],
      0,
    );

    this.value = result;

    return result;
  }

  private get trendValue(): string | undefined {
    if (
      typeof this.value !== "number" ||
      TotalApplications.METRIC_DEFINITION.card.trendValueFormat === undefined
    ) {
      return undefined;
    }

    if (
      TotalApplications.METRIC_DEFINITION.card.trendValueFormat === "points"
    ) {
      return toTrendPointLabel(this.value);
    }

    return toTrendPercentLabel(this.value);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: TotalApplications.METRIC_DEFINITION.id,
      title: TotalApplications.METRIC_DEFINITION.card.title,
      description: TotalApplications.METRIC_DEFINITION.card.description,
      icon: TotalApplications.METRIC_DEFINITION.card.icon,
      tone: TotalApplications.METRIC_DEFINITION.card.tone,
      value: this.value ?? 0,
      suffix: TotalApplications.METRIC_DEFINITION.card.suffix,
      trendLabel: TotalApplications.METRIC_DEFINITION.card.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
