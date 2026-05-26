/**
 * Converts a boolean flag into SQLite-friendly integer representation.
 */
export function toDbBooleanInt(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

/**
 * Normalizes mixed persistence values into a boolean.
 */
export function fromDbBoolean(value: unknown, fallback = false): boolean {
  if (value === true || value === false) {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "1" || normalized === "true") {
      return true;
    }

    if (normalized === "0" || normalized === "false") {
      return false;
    }
  }

  return fallback;
}

/**
 * Parses a JSON object (or object-like input) into a boolean record.
 */
export function parseBooleanRecordValue(
  value: unknown,
  fallback: Record<string, boolean>,
): Record<string, boolean> {
  let candidate: unknown = value;

  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return { ...fallback };
    }
  }

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return { ...fallback };
  }

  return Object.entries(candidate).reduce<Record<string, boolean>>(
    (accumulator, [key, recordValue]) => {
      accumulator[key] = Boolean(recordValue);
      return accumulator;
    },
    {},
  );
}
