import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";

type TemporalNamespace = typeof TemporalPolyfill;

type TemporalInstant = InstanceType<TemporalNamespace["Instant"]>;

export type TemporalDateTime = TemporalInstant | Date;

interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

type GlobalWithTemporal = typeof globalThis & {
  Temporal?: TemporalNamespace;
};

const SQLITE_UTC_DATETIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?)$/;

const SQLITE_LOCAL_DATETIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?)$/;

const LOCAL_ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/;

interface NormalizedDateInput {
  normalized: string;
}

/**
 * Normalizes non-ISO persisted timestamp variants to Temporal-compatible forms.
 */
function normalizeDateInput(raw: string): NormalizedDateInput {
  const trimmed = raw.trim();
  const sqliteUtcMatch = SQLITE_UTC_DATETIME_PATTERN.exec(trimmed);
  if (sqliteUtcMatch) {
    return {
      normalized: `${sqliteUtcMatch[1]}T${sqliteUtcMatch[2]}Z`,
    };
  }

  const sqliteLocalMatch = SQLITE_LOCAL_DATETIME_PATTERN.exec(trimmed);
  if (sqliteLocalMatch) {
    return {
      normalized: `${sqliteLocalMatch[1]}T${sqliteLocalMatch[2]}`,
    };
  }

  return {
    normalized: trimmed,
  };
}

/**
 * Type guard for native JavaScript Date values.
 */
export function isJsDate(value: unknown): value is Date {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Object.prototype.toString.call(value) !== "[object Date]") {
    return false;
  }

  const candidate = value as { getTime?: () => number };
  if (typeof candidate.getTime !== "function") {
    return false;
  }

  return Number.isFinite(candidate.getTime());
}

/**
 * Resolve native Temporal when available and fall back to the polyfill otherwise.
 */
export function getTemporal(): TemporalNamespace {
  const globalWithTemporal = globalThis as GlobalWithTemporal;
  return globalWithTemporal.Temporal ?? TemporalPolyfill;
}

/**
 * Returns the current instant in epoch milliseconds.
 */
export function temporalNowEpochMilliseconds(): number {
  return getTemporal().Now.instant().epochMilliseconds;
}

/**
 * Returns the current instant as an ISO-8601 string.
 */
export function temporalNowIsoString(): string {
  return getTemporal().Now.instant().toString();
}

/**
 * Returns the current local hour using Temporal time zone semantics.
 */
export function temporalNowHour(): number {
  const temporal = getTemporal();
  const zonedNow = temporal.Now.instant().toZonedDateTimeISO(
    temporal.Now.timeZoneId(),
  );

  return zonedNow.hour;
}

/**
 * Converts a Date to epoch milliseconds through Temporal.
 */
export function temporalToEpochMilliseconds(value: TemporalDateTime): number {
  if (isJsDate(value)) {
    return getTemporal().Instant.fromEpochMilliseconds(value.getTime())
      .epochMilliseconds;
  }

  return value.epochMilliseconds;
}

/**
 * Converts a Date to an ISO-8601 string through Temporal.
 */
export function temporalToIsoString(value: TemporalDateTime): string {
  if (isJsDate(value)) {
    return getTemporal()
      .Instant.fromEpochMilliseconds(temporalToEpochMilliseconds(value))
      .toString();
  }

  return value.toString();
}

/**
 * Clones a Date via Temporal epoch milliseconds conversion.
 */
export function temporalCloneDate(value: TemporalDateTime): TemporalDateTime {
  return new Date(temporalToEpochMilliseconds(value));
}

/**
 * Converts unknown date-like input to Date through Temporal parsing.
 */
export function temporalDateFromUnknown(value: unknown): TemporalDateTime {
  if (isJsDate(value)) {
    return temporalCloneDate(value);
  }

  const temporal = getTemporal();
  const normalizedInput = normalizeDateInput(String(value));
  try {
    const instant = temporal.Instant.from(normalizedInput.normalized);
    return new Date(instant.epochMilliseconds);
  } catch {
    if (LOCAL_ISO_DATETIME_PATTERN.test(normalizedInput.normalized)) {
      const plainDateTime = temporal.PlainDateTime.from(
        normalizedInput.normalized,
      );
      const zonedDateTime = plainDateTime.toZonedDateTime(
        temporal.Now.timeZoneId(),
      );
      return new Date(zonedDateTime.toInstant().epochMilliseconds);
    }

    throw new Error(`Invalid temporal date input: ${String(value)}`);
  }
}

/**
 * Builds a Date from local date-time parts using Temporal local time zone handling.
 */
export function temporalDateFromLocalParts(
  parts: LocalDateTimeParts,
): TemporalDateTime {
  const temporal = getTemporal();
  const plainDateTime = temporal.PlainDateTime.from(parts);
  const zonedDateTime = plainDateTime.toZonedDateTime(
    temporal.Now.timeZoneId(),
  );

  return new Date(zonedDateTime.toInstant().epochMilliseconds);
}

/**
 * Extracts local date-time parts from Date using Temporal and the local time zone.
 */
export function temporalToLocalParts(
  value: TemporalDateTime,
): LocalDateTimeParts {
  const temporal = getTemporal();
  const zonedDateTime = temporal.Instant.fromEpochMilliseconds(
    temporalToEpochMilliseconds(value),
  ).toZonedDateTimeISO(temporal.Now.timeZoneId());

  return {
    year: zonedDateTime.year,
    month: zonedDateTime.month,
    day: zonedDateTime.day,
    hour: zonedDateTime.hour,
    minute: zonedDateTime.minute,
  };
}
