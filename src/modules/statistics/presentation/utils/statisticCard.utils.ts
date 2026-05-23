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
