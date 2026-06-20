import type {
  InsightCardMetricDefinition,
  MetricCardDefinition,
} from "../types/insight";
import type { IMetric } from "../types/metric";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/insightMetricUtils";

/** Total applications applied in the 30-day window before the last 30 days. */
export class ApplicationsAppliedPrevious30Days implements IMetric {
  public static readonly id = "applicationsAppliedPrevious30Days";

  public static readonly QUERY = `SELECT
SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END) AS ${ApplicationsAppliedPrevious30Days.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  public static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Applied previous 30 days",
    description: "Applications applied in the prior 30-day window",
    icon: "heroicons:clock",
    tone: "default",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsAppliedPrevious30Days.QUERY,
    );

    const result = toFiniteNumber(
      rows[0]?.[ApplicationsAppliedPrevious30Days.id],
      0,
    );

    this.value = result;

    return result;
  }

  public toView(): InsightCardMetricDefinition {
    return {
      id: ApplicationsAppliedPrevious30Days.id,
      title: ApplicationsAppliedPrevious30Days.CARD_DEFINITION.title,
      description:
        ApplicationsAppliedPrevious30Days.CARD_DEFINITION.description,
      icon: ApplicationsAppliedPrevious30Days.CARD_DEFINITION.icon,
      tone: ApplicationsAppliedPrevious30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}

