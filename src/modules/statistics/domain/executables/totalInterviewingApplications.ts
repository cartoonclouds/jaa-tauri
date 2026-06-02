import type { IExecutable } from "../types/executable";
import type {
  MetricCardDefinition,
  StatisticCardMetricDefinition,
} from "../types/Statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/statisticMetricUtils";
import { INTERVIEWING_STAGE_PREDICATE_SQL } from "./statisticSql";

/** Total applications currently in interview pipeline stages. */
export class TotalInterviewingApplications implements IExecutable<number> {
  public static id = "totalInterviewingApplications";

  private static readonly QUERY = `SELECT
SUM(CASE WHEN ${INTERVIEWING_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS ${TotalInterviewingApplications.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  private static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Interviewing",
    description: "Phone screening, technical, and interview",
    icon: "heroicons:chat-bubble-left-right",
    tone: "warning",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      TotalInterviewingApplications.QUERY,
    );

    const result = toFiniteNumber(
      rows[0]?.[TotalInterviewingApplications.id],
      0,
    );

    this.value = result;

    return result;
  }

  public toView(): StatisticCardMetricDefinition {
    return {
      id: TotalInterviewingApplications.id,
      title: TotalInterviewingApplications.CARD_DEFINITION.title,
      description: TotalInterviewingApplications.CARD_DEFINITION.description,
      icon: TotalInterviewingApplications.CARD_DEFINITION.icon,
      tone: TotalInterviewingApplications.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}
