/**
 * Converts unknown input to a required string representation.
 */
export function toRequiredString(value: unknown): string {
  return String(value);
}

/**
 * Converts unknown input to a nullable string representation.
 */
export function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}
