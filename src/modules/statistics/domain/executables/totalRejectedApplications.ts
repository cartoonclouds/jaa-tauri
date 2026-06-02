import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../entities/Statistic";
import type { IExecutable } from "../types/executable";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";
import { REJECTED_STAGE_PREDICATE_SQL } from "./statisticSql";

/** Total applications currently marked as rejected. */
export class TotalRejectedApplications implements IExecutable<number> {
  public static id = "totalRejectedApplications";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${REJECTED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS ${TotalRejectedApplications.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Rejections",
    description: "Applications closed as rejected",
    icon: "heroicons:x-circle",
    tone: "danger",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      TotalRejectedApplications.QUERY,
    );

    const result = toFiniteNumber(rows[0]?.[TotalRejectedApplications.id], 0);

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: TotalRejectedApplications.id,
      title: TotalRejectedApplications.CARD_DEFINITION.title,
      description: TotalRejectedApplications.CARD_DEFINITION.description,
      icon: TotalRejectedApplications.CARD_DEFINITION.icon,
      tone: TotalRejectedApplications.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
