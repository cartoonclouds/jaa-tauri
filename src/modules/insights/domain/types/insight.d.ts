import type { HeroIcon } from "@/shared/types";
import type { INSIGHT_METRIC_IDS } from "@modules/insights/domain/constants/insightMetricIds";
import type { TemporalDateTime } from "@shared/utils/temporal";

export type InsightMetricId = (typeof INSIGHT_METRIC_IDS)[number];

export interface MetricCardDefinition {
  title: string;
  description: string;
  icon: HeroIcon;
  tone: InsightCardTone;
  suffix?: string;
  trendLabel?: string;
  trendValueField?: string;
  trendToneField?: string;
  trendValueFormat?: InsightTrendValueFormat;
}

/**
 * Configuration contract for a single insight card metric.
 */
export interface InsightCardMetricDefinition {
  id: InsightMetricId;
  title: string;
  description: string;
  icon: HeroIcon;
  tone: InsightCardTone;
  value: number;
  suffix?: string;
  trendLabel?: string;
  trendValue?: string;
  trendTone?: InsightTrendTone;
}

/**
 * Insight aggregate used by the insights module.
 */
export interface Insight {
  /** Unique insight identifier. */
  id: string;
  /** Human-readable metric name. */
  name: string;
  /** Numeric metric value. */
  value: number;
  /** Scope where this metric applies. */
  scope: InsightScope;
  /** Optional timestamp when the metric was captured. */
  recordedAt: TemporalDateTime | null;
  /** Creation timestamp. */
  createdAt: TemporalDateTime;
  /** Last update timestamp. */
  updatedAt: TemporalDateTime;
}

/**
 * Input required to create an insight.
 */
export interface CreateInsightInput {
  /** Human-readable metric name. */
  name: string;
  /** Numeric metric value. */
  value: number;
  /** Scope where this metric applies. */
  scope?: InsightScope;
  /** Optional timestamp when the metric was captured. */
  recordedAt?: TemporalDateTime | null;
}

/**
 * Type alias for insight card tone.
 */
export type InsightCardTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

/**
 * Type alias for insight trend value format.
 */
export type InsightTrendValueFormat = "percent" | "points";

/**
 * Defines insight card definition.
 */
export interface InsightCardDefinition {
  title: string;
  description: string;
  icon: string;
  tone: InsightCardTone;
  valueField?: string;
  suffix?: string;
  trendLabel?: string;
  trendValueField?: string;
  trendToneField?: string;
  trendValueFormat?: InsightTrendValueFormat;
}

/**
 * Defines insight metric definition.
 */
export interface InsightMetricDefinition {
  id: InsightMetricId;
  aggregateSql?: string;
  card?: InsightCardDefinition;
}

/**
 * Classification used to scope where an insight is collected.
 */
export type InsightScope = "global" | "company" | "application";

/**
 * Type alias for insight trend tone.
 */
export type InsightTrendTone = "positive" | "negative" | "neutral";
