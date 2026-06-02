import type { StatisticTrendTone } from "../../domain/types/Statistic";

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

export function toRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

export function toTrendPercent(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}
