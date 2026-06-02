import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";
import {
  PREVIOUS_30_DAYS_APPLIED_SQL,
  RESPONDED_STAGE_PREDICATE_SQL,
} from "./statisticSql";

/** Previous-30-day applications that reached interview or final response stages. */
export class ApplicationsRespondedPrevious30Days implements IExecutable {
  public static readonly id = "applicationsRespondedPrevious30Days";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} AND ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS ${ApplicationsRespondedPrevious30Days.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Responded previous 30 days",
    description: "Prior applied cohorts that reached interview/final outcomes",
    icon: "heroicons:chat-bubble-left-right",
    tone: "default",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      ApplicationsRespondedPrevious30Days.QUERY,
    );

    const result = toFiniteNumber(
      rows[0]?.[ApplicationsRespondedPrevious30Days.id],
      0,
    );

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: ApplicationsRespondedPrevious30Days.id,
      title: ApplicationsRespondedPrevious30Days.CARD_DEFINITION.title,
      description:
        ApplicationsRespondedPrevious30Days.CARD_DEFINITION.description,
      icon: ApplicationsRespondedPrevious30Days.CARD_DEFINITION.icon,
      tone: ApplicationsRespondedPrevious30Days.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
