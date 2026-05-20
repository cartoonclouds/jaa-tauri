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

export function toNullableDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return toDate(value);
}
