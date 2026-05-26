/**
 * Converts unknown input to a finite number, otherwise returns the provided fallback.
 */
export function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

/**
 * Converts unknown input to a nullable finite number.
 */
export function toNullableNumber(value: unknown): number | null {
  const parsed = toFiniteNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}
