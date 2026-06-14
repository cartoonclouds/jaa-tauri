/**
 * Parse a stringified array into a string array.
 *
 * Returns the fallback when the input is not a string, not valid JSON,
 * or does not contain an array of strings.
 */
export function parseStringArray(
  value: unknown,
  fallback: string[] = [],
): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string") {
    return [...fallback];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [...fallback];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [...fallback];
  }
}
