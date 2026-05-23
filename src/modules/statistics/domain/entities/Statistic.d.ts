import type { StatisticScope } from "@modules/statistics/domain/types/StatisticType";

/**
 * Statistic aggregate used by the statistics module.
 */
export interface Statistic {
  /** Unique statistic identifier. */
  id: string;
  /** Human-readable metric name. */
  name: string;
  /** Numeric metric value. */
  value: number;
  /** Scope where this metric applies. */
  scope: StatisticScope;
  /** Optional timestamp when the metric was captured. */
  recordedAt: Date | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a statistic.
 */
export interface CreateStatisticInput {
  /** Human-readable metric name. */
  name: string;
  /** Numeric metric value. */
  value: number;
  /** Scope where this metric applies. */
  scope?: StatisticScope;
  /** Optional timestamp when the metric was captured. */
  recordedAt?: Date | null;
}



