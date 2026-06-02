import type { IMetric } from "../types/metric";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";
import {
  OFFER_STAGE_PREDICATE_SQL,
  REJECTED_STAGE_PREDICATE_SQL,
} from "./statisticSql";

/** Active pipeline applications excluding offer and rejected outcomes. */
export class ActivePipelineApplications implements IMetric {
  public static readonly id = "activePipelineApplications";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN NOT (${OFFER_STAGE_PREDICATE_SQL}) AND NOT (${REJECTED_STAGE_PREDICATE_SQL}) THEN 1 ELSE 0 END) AS ${ActivePipelineApplications.id}
FROM applications
WHERE deleted_at IS NULL`;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Active pipeline",
    description: "Open opportunities excluding offer/rejected",
    icon: "heroicons:queue-list",
    tone: "success",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ActivePipelineApplications.QUERY,
    );

    const result = toFiniteNumber(rows[0]?.[ActivePipelineApplications.id], 0);

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ActivePipelineApplications.id,
      title: ActivePipelineApplications.CARD_DEFINITION.title,
      description: ActivePipelineApplications.CARD_DEFINITION.description,
      icon: ActivePipelineApplications.CARD_DEFINITION.icon,
      tone: ActivePipelineApplications.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
