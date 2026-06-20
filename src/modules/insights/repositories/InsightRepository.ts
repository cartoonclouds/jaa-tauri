import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { MetricCardDefinition } from "@modules/insights/domain/types/insight";
import type { IMetric } from "@modules/insights/domain/types/metric";
import type {
  IInsightRepository,
  InsightMetricListItem,
} from "@modules/insights/types";

import {
  ActivePipelineApplications,
  ApplicationsAppliedLast30Days,
  ApplicationsAppliedPrevious30Days,
  ApplicationsCreatedLast30Days,
  ApplicationsCreatedPrevious30Days,
  ApplicationsOfferLast30Days,
  ApplicationsOfferPrevious30Days,
  ApplicationsRespondedLast30Days,
  ApplicationsRespondedPrevious30Days,
  OfferRate,
  RejectionRate,
  ResponseRate,
  TotalApplications,
  TotalAppliedApplications,
  TotalInterviewingApplications,
  TotalOffers,
  TotalRejectedApplications,
} from "../domain/executables";

interface InsightMetricExecutable {
  new (db: DatabaseDriver): IMetric;
  id: string;
  QUERY: string;
  CARD_DEFINITION: MetricCardDefinition;
}

/**
 * Internal executable classes used to compute insight metrics.
 */
export const INTERNAL_METRIC_DEFINITIONS: readonly InsightMetricExecutable[] = [
  TotalApplications,
  TotalAppliedApplications,
  TotalInterviewingApplications,
  TotalOffers,
  TotalRejectedApplications,
  ApplicationsCreatedLast30Days,
  ApplicationsAppliedLast30Days,
  ActivePipelineApplications,
  ResponseRate,
  OfferRate,
  RejectionRate,
  ApplicationsCreatedPrevious30Days,
  ApplicationsAppliedPrevious30Days,
  ApplicationsRespondedLast30Days,
  ApplicationsRespondedPrevious30Days,
  ApplicationsOfferLast30Days,
  ApplicationsOfferPrevious30Days,
] as const;

/**
 * Card metric definitions rendered on the insights page.
 */
export const CARD_METRIC_DEFINITIONS = INTERNAL_METRIC_DEFINITIONS;

/**
 * Database-backed repository for insights and computed overview metrics.
 */
export class InsightRepository implements IInsightRepository {
  constructor(private readonly db: DatabaseDriver) {}

  /**
   * Return registered metric metadata including SQL query and card definition.
   */
  list(): Promise<InsightMetricListItem[]> {
    return Promise.resolve(
      INTERNAL_METRIC_DEFINITIONS.map((MetricClass) => ({
        id: MetricClass.id,
        query: MetricClass.QUERY,
        cardDefinition: MetricClass.CARD_DEFINITION,
      })),
    );
  }

  /**
   * Execute all configured metrics and return executable instances with computed values.
   */
  async getOverview(): Promise<IMetric[]> {
    const metrics = INTERNAL_METRIC_DEFINITIONS.map(
      (MetricClass) => new MetricClass(this.db),
    );

    await Promise.all(metrics.map(async (metric) => await metric.execute()));

    return metrics;
  }
}
