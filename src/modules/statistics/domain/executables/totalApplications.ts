import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toTrendPercentLabel,
  toTrendTone,
} from "../../presentation/utils/statisticMetricUtils";

/** Total applications currently tracked (excluding deleted rows). */
export class TotalApplications implements IExecutable<number> {
  public static readonly id = "totalApplications";

  private static readonly QUERY = `SELECT
COUNT(*) AS ${TotalApplications.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Total applications",
    description: "All active records in your tracker",
    icon: "heroicons:briefcase",
    tone: "info",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      TotalApplications.QUERY,
    );

    const result = toFiniteNumber(rows[0]?.[TotalApplications.id], 0);

    this.value = result;

    return result;
  }

  private get trendValue(): string | undefined {
    if (typeof this.value !== "number") {
      return undefined;
    }

    return toTrendPercentLabel(this.value);
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: TotalApplications.id,
      title: TotalApplications.CARD_DEFINITION.title,
      description: TotalApplications.CARD_DEFINITION.description,
      icon: TotalApplications.CARD_DEFINITION.icon,
      tone: TotalApplications.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
