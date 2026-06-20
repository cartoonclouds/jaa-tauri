import type {
  InsightCardMetricDefinition,
  MetricCardDefinition,
} from "../types/insight";
import type { IMetric } from "../types/metric";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import {
  toTrendPercentLabel,
  toTrendTone,
} from "../../presentation/utils/insightMetricUtils";

/** Total applications currently tracked (excluding deleted rows). */
export class TotalAppliedApplications implements IMetric {
  public static readonly id = "totalAppliedApplications";

  public static readonly QUERY = `SELECT
SUM(CASE WHEN applied_at IS NOT NULL THEN 1 ELSE 0 END) AS ${TotalAppliedApplications.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  public static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Total applied",
    description: "All applications with an applied date",
    icon: "heroicons:check-circle",
    tone: "success",
    trendLabel: "Change vs total applications",
    trendValueFormat: "percent",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      TotalAppliedApplications.QUERY,
    );

    const result = toFiniteNumber(rows[0]?.[TotalAppliedApplications.id], 0);

    this.value = result;

    return result;
  }

  private get trendValue(): string | undefined {
    if (typeof this.value !== "number") {
      return undefined;
    }

    return toTrendPercentLabel(this.value);
  }

  public toView(): InsightCardMetricDefinition {
    return {
      id: TotalAppliedApplications.id,
      title: TotalAppliedApplications.CARD_DEFINITION.title,
      description: TotalAppliedApplications.CARD_DEFINITION.description,
      icon: TotalAppliedApplications.CARD_DEFINITION.icon,
      tone: TotalAppliedApplications.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendLabel: TotalAppliedApplications.CARD_DEFINITION.trendLabel,
      trendValue: this.trendValue,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}

