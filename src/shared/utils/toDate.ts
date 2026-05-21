/**
 * Convert an unknown value into a valid Date instance.
 *
 * Accepts either an existing Date or a parseable date-like value.
 * Throws when the value cannot be parsed.
 */
export function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${String(value)}`);
  }

  return parsed;
}

/**
 * Convert an unknown value into a Date or null.
 *
 * Treats empty values as missing and defers parsing to {@link toDate}.
 */
export function toNullableDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return toDate(value);
}
