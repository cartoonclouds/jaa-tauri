import type { StatisticCardTone } from "../../statisticMetricDefinitions";
import type { HeroIcon } from "@/shared/types";
import type { StatisticScope } from "@modules/statistics/domain/types/StatisticType";

export interface MetricCardDefinition {
  title: string;
  description: string;
  icon: HeroIcon;
  tone: StatisticCardTone;
  suffix?: string;
  trendLabel?: string;
  trendValueField?: string;
  trendToneField?: string;
  trendValueFormat?: StatisticTrendValueFormat;
}

/**
 * Configuration contract for a single statistic card metric.
 */
export interface StatisticCardMetricDefinition {
  id: string;
  title: string;
  description: string;
  icon: HeroIcon;
  tone: StatisticCardTone;
  value: number;
  suffix?: string;
  trendLabel?: string;
  trendValue?: string;
  trendTone?: StatisticTrendTone;
}

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
