import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/Statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";
import {
  LAST_30_DAYS_APPLIED_SQL,
  RESPONDED_STAGE_PREDICATE_SQL,
} from "./statisticSql";

/** Last-30-day applications that reached interview or final response stages. */
export class ApplicationsRespondedLast30Days implements IExecutable<number> {
  public static id = "applicationsRespondedLast30Days";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} AND ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS ${ApplicationsRespondedLast30Days.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Responded last 30 days",
    description: "Applied cohorts that reached interview/final outcomes",
    icon: "heroicons:chat-bubble-left-right",
    tone: "default",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsRespondedLast30Days.QUERY,
    );

    const result = toFiniteNumber(
      rows[0]?.[ApplicationsRespondedLast30Days.id],
      0,
    );

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsRespondedLast30Days.id,
      title: ApplicationsRespondedLast30Days.CARD_DEFINITION.title,
      description: ApplicationsRespondedLast30Days.CARD_DEFINITION.description,
      icon: ApplicationsRespondedLast30Days.CARD_DEFINITION.icon,
      tone: ApplicationsRespondedLast30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
