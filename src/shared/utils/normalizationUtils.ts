/**
 * Normalizes an unknown value to one of the allowed string literals.
 */
export function normalizeLiteralValue<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
  fallback: TValue,
): TValue {
  if (typeof value !== "string") {
    return fallback;
  }

  const matchedValue = allowedValues.find(
    (allowedValue) => allowedValue === value,
  );
  return matchedValue ?? fallback;
}

/**
 * Normalizes an unknown value with alias support before validating allowed literals.
 */
export function normalizeAliasedLiteralValue<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
  aliases: Readonly<Record<string, TValue>>,
  fallback: TValue,
): TValue {
  if (typeof value !== "string") {
    return fallback;
  }

  const aliasedValue = aliases[value] ?? value;
  const matchedValue = allowedValues.find(
    (allowedValue) => allowedValue === aliasedValue,
  );

  return matchedValue ?? fallback;
}
