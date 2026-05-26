/**
 * Normalize persisted constant values to plain scalar strings.
 *
 * Examples:
 * - {"value":{"value":"applied"}} -> "applied"
 * - {"value":"applied"} -> "applied"
 * - "\"applied\"" -> "applied"
 */
export function normalizeConstantValue(value: string): string {
  const original = value.trim();
  if (!original) {
    return "";
  }

  let current: unknown = original;

  for (let depth = 0; depth < 6; depth += 1) {
    if (typeof current === "string") {
      const trimmed = current.trim();
      if (!trimmed) {
        return "";
      }

      try {
        current = JSON.parse(trimmed);
        continue;
      } catch {
        return trimmed;
      }
    }

    if (
      current !== null &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      "value" in current
    ) {
      current = current.value;
      continue;
    }

    if (typeof current === "number" || typeof current === "boolean") {
      return String(current);
    }

    return original;
  }

  if (typeof current === "string") {
    return current.trim();
  }

  if (typeof current === "number" || typeof current === "boolean") {
    return String(current);
  }

  return original;
}
