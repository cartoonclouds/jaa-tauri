import type { IMetric } from "@modules/statistics/domain/types/metric";
import type { Statistic } from "@modules/statistics/domain/types/statistic";

/**
 * Persistence contract for statistics metrics.
 */
export interface IStatisticRepository {
  /** Read all persisted statistic records. */
  list(): Promise<Statistic[]>;
  /** Fetch aggregated statistics for the job applications dashboard. */
  getOverview(): Promise<IMetric[]>;
}

/**
 * Shared visibility buckets for metrics with an id.
 */
export interface MetricVisibilityBuckets<TMetric extends { id: string }> {
  visible: TMetric[];
  hidden: TMetric[];
}
