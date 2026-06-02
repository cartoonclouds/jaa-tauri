/**
 * Converts unknown input to a required string representation.
 */
export function toRequiredString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
}

/**
 * Converts unknown input to a nullable string representation.
 */
export function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return toRequiredString(value);
}
