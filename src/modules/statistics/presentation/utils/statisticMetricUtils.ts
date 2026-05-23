import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

import {
  STATISTIC_METRIC_DEFINITIONS,
  type StatisticCardTone,
} from "@modules/statistics/statisticMetricDefinitions";

/**
 * Visual trend tone used by statistic cards.
 */
export type StatisticTrendTone = "positive" | "negative" | "neutral";

/**
 * Resolve trend tone from a signed numeric delta.
 */
export function toTrendTone(value: number): StatisticTrendTone {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

/**
 * Format a signed percentage value for card trend badges.
 */
export function toTrendPercentLabel(value: number): string {
  if (value > 0) {
    return `+${String(value)}%`;
  }

  return `${String(value)}%`;
}

/**
 * Format a signed percentage-point delta for rate trend badges.
 */
export function toTrendPointLabel(value: number): string {
  if (value > 0) {
    return `+${String(value)}pp`;
  }

  return `${String(value)}pp`;
}

/**
 * Configuration contract for a single statistic card metric.
 */
export interface StatisticCardMetricDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: StatisticCardTone;
  value: (overview: StatisticsOverview) => number;
  suffix?: string;
  trendLabel?: string;
  trendValue?: (overview: StatisticsOverview) => string;
  trendTone?: (overview: StatisticsOverview) => StatisticTrendTone;
}

/**
 * Shared metric definitions used to render statistics cards consistently.
 */
export const statisticMetricDefinitions: readonly StatisticCardMetricDefinition[] =
  STATISTIC_METRIC_DEFINITIONS.flatMap((metric) => {
    if (!metric.card) {
      return [];
    }

    const valueField = metric.card.valueField ?? metric.id;

    return [
      {
        id: metric.id,
        title: metric.card.title,
        description: metric.card.description,
        icon: metric.card.icon,
        tone: metric.card.tone,
        value: (overview: StatisticsOverview) => overview[valueField],
        suffix: metric.card.suffix,
        trendLabel: metric.card.trendLabel,
        trendValue: metric.card.trendValueField
          ? (overview: StatisticsOverview) => {
              const trendValue =
                overview[metric.card?.trendValueField ?? metric.id];

              if (metric.card?.trendValueFormat === "points") {
                return toTrendPointLabel(trendValue);
              }

              return toTrendPercentLabel(trendValue);
            }
          : undefined,
        trendTone: metric.card.trendToneField
          ? (overview: StatisticsOverview) =>
              toTrendTone(overview[metric.card?.trendToneField ?? metric.id])
          : undefined,
      },
    ];
  });
