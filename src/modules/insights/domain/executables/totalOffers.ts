import type {
  InsightCardMetricDefinition,
  MetricCardDefinition,
} from "../types/insight";
import type { IMetric } from "../types/metric";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { toFiniteNumber } from "@/shared/utils/database-mapping/numberValueUtils";

import { toTrendTone } from "../../presentation/utils/insightMetricUtils";
import { OFFER_STAGE_PREDICATE_SQL } from "./insightSql";

/** Total applications currently marked as offer. */
export class TotalOffers implements IMetric {
  public static readonly id = "totalOffers";

  public static readonly QUERY = `SELECT
SUM(CASE WHEN ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END) AS ${TotalOffers.id}
FROM applications
WHERE deleted_at IS NULL` as const;

  public static readonly CARD_DEFINITION: MetricCardDefinition = {
    title: "Offers",
    description: "Current opportunities at offer stage",
    icon: "heroicons:star",
    tone: "success",
  } as const;

  private value: number | null = null;

  constructor(private readonly db: DatabaseDriver) {}

  public async execute(): Promise<number> {
    const rows = await this.db.select<Partial<Record<string, unknown>>>(
      TotalOffers.QUERY,
    );

    const result = toFiniteNumber(rows[0]?.[TotalOffers.id], 0);

    this.value = result;

    return result;
  }

  public toView(): InsightCardMetricDefinition {
    return {
      id: TotalOffers.id,
      title: TotalOffers.CARD_DEFINITION.title,
      description: TotalOffers.CARD_DEFINITION.description,
      icon: TotalOffers.CARD_DEFINITION.icon,
      tone: TotalOffers.CARD_DEFINITION.tone,
      value: this.value ?? 0,
      trendTone: toTrendTone(this.value ?? 0),
    };
  }
}

