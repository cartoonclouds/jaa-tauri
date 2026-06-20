import type { MetricCardDefinition } from "@modules/insights/domain/types/insight";
import type { IMetric } from "@modules/insights/domain/types/metric";

/**
 * Metadata for a registered insight metric executable.
 */
export interface InsightMetricListItem {
  id: string;
  query: string;
  cardDefinition: MetricCardDefinition;
}

/**
 * Persistence contract for insight metrics.
 */
export interface IInsightRepository {
  /** Return registered insight metric metadata. */
  list(): Promise<InsightMetricListItem[]>;
  /** Fetch aggregated insights for the job applications dashboard. */
  getOverview(): Promise<IMetric[]>;
}

/**
 * Shared visibility buckets for metrics with an id.
 */
export interface MetricVisibilityBuckets<TMetric extends { id: string }> {
  visible: TMetric[];
  hidden: TMetric[];
}
