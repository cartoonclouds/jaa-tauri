import type { IMetric } from "../types/metric";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";

/** Total applications created in the 30-day window before the last 30 days. */
export class ApplicationsCreatedPrevious30Days implements IMetric {
  public static readonly id = "applicationsCreatedPrevious30Days";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN datetime(created_at) >= datetime('now', '-60 day') AND datetime(created_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END) AS ${ApplicationsCreatedPrevious30Days.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Created previous 30 days",
    description: "Opportunities added in the prior 30-day window",
    icon: "heroicons:clock",
    tone: "default",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsCreatedPrevious30Days.QUERY,
    );

    const result = toFiniteNumber(
      rows[0]?.[ApplicationsCreatedPrevious30Days.id],
      0,
    );

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsCreatedPrevious30Days.id,
      title: ApplicationsCreatedPrevious30Days.CARD_DEFINITION.title,
      description:
        ApplicationsCreatedPrevious30Days.CARD_DEFINITION.description,
      icon: ApplicationsCreatedPrevious30Days.CARD_DEFINITION.icon,
      tone: ApplicationsCreatedPrevious30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
