import type { HeroIcon } from "@/shared/types";

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

/**
 * Type alias for statistic card tone.
 */
export type StatisticCardTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";
/**
 * Type alias for statistic trend value format.
 */
export type StatisticTrendValueFormat = "percent" | "points";

/**
 * Defines statistic card definition.
 */
export interface StatisticCardDefinition {
  title: string;
  description: string;
  icon: string;
  tone: StatisticCardTone;
  valueField?: string;
  suffix?: string;
  trendLabel?: string;
  trendValueField?: string;
  trendToneField?: string;
  trendValueFormat?: StatisticTrendValueFormat;
}

/**
 * Defines statistic metric definition.
 */
export interface StatisticMetricDefinition {
  id: string;
  aggregateSql?: string;
  card?: StatisticCardDefinition;
}

/**
 * Classification used to scope where a statistic is collected.
 */
export type StatisticScope = "global" | "company" | "application";

/**
 * Type alias for statistic trend tone.
 */
export type StatisticTrendTone = "positive" | "negative" | "neutral";
