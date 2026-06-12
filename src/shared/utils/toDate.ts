import { ValidationError } from "@shared/domain/errors";
import {
  temporalCloneDate,
  temporalDateFromLocalParts,
  temporalDateFromUnknown,
  type TemporalDateTime,
  temporalNowHour,
  temporalNowIsoString,
  temporalToEpochMilliseconds,
  temporalToLocalParts,
} from "@shared/utils/temporal";

/**
 * Convert an unknown value into a valid Date instance.
 *
 * Accepts either an existing Date or a parseable date-like value.
 * Throws when the value cannot be parsed.
 */
export function toDate(value: unknown): TemporalDateTime {
  if (value instanceof Date) {
    return temporalCloneDate(value);
  }

  try {
    return temporalDateFromUnknown(value);
  } catch {
    throw new ValidationError(`Invalid date value: ${String(value)}`);
  }
}

/**
 * Convert an unknown value into a Date or null.
 *
 * Treats empty values as missing and defers parsing to {@link toDate}.
 */
export function toNullableDate(value: unknown): TemporalDateTime | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return toDate(value);
}

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const DISPLAY_DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Format a Date for date-only display in the UI.
 */
export function formatDisplayDate(value: TemporalDateTime): string {
  return DISPLAY_DATE_FORMATTER.format(temporalToEpochMilliseconds(value));
}

/**
 * Format a Date for date-time display in the UI.
 */
export function formatDisplayDateTime(value: TemporalDateTime): string {
  return DISPLAY_DATE_TIME_FORMATTER.format(temporalToEpochMilliseconds(value));
}

/**
 * Format a Date for use with an HTML datetime-local input.
 */
export function formatDateTimeLocalValue(
  value: TemporalDateTime | null,
): string {
  if (!value) {
    return "";
  }

  const parts = temporalToLocalParts(value);
  const year = String(parts.year);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  const hour = String(parts.hour).padStart(2, "0");
  const minute = String(parts.minute).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Parse a datetime-local input value into a Date.
 *
 * Returns null when the input is empty or not a valid local date-time string.
 */
function parseDateTimeLocalValue(
  value: string,
): TemporalDateTime | null {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const dateParts = datePart.split("-");
  const timeParts = timePart.split(":");
  if (dateParts.length !== 3 || timeParts.length < 2) {
    return null;
  }

  const [yearPart = "", monthPart = "", dayPart = ""] = dateParts;
  const [hourPart = "", minutePart = ""] = timeParts;

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  try {
    return temporalDateFromLocalParts({ year, month, day, hour, minute });
  } catch {
    return null;
  }
}

/**
 * Format a Date as a relative time string (e.g. "just now", "5 minutes ago", "in 2 hours").
 *
 * Falls back to a display date format for dates more than a month in the past or future.
 *
 * @param {Date} value - The date to format.
 * @param {Date} [now=current instant] - The reference date for calculating the relative time.
 * @returns {string} A relative time string or a formatted date.
 */
export function formatRelativeDate(
  value: TemporalDateTime,
  now: TemporalDateTime = toDate(temporalNowIsoString()),
): string {
  const diffMs =
    temporalToEpochMilliseconds(value) - temporalToEpochMilliseconds(now);
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);

  if (diffSeconds >= -30 && diffSeconds <= 30) {
    return "just now";
  }

  if (diffMinutes >= -1 && diffMinutes <= 1) {
    return `${String(Math.abs(diffMinutes))} minute${Math.abs(diffMinutes) !== 1 ? "s" : ""} ${
      diffMinutes < 0 ? "ago" : "from now"
    }`;
  }

  if (diffHours >= -1 && diffHours <= 1) {
    return `${String(Math.abs(diffHours))} hour${Math.abs(diffHours) !== 1 ? "s" : ""} ${
      diffHours < 0 ? "ago" : "from now"
    }`;
  }

  if (diffDays >= -1 && diffDays <= 1) {
    return `${String(Math.abs(diffDays))} day${Math.abs(diffDays) !== 1 ? "s" : ""} ${
      diffDays < 0 ? "ago" : "from now"
    }`;
  }

  if (diffWeeks >= -1 && diffWeeks <= 1) {
    return `${String(Math.abs(diffWeeks))} week${Math.abs(diffWeeks) !== 1 ? "s" : ""} ${
      diffWeeks < 0 ? "ago" : "from now"
    }`;
  }

  if (diffMonths >= -1 && diffMonths <= 1) {
    return `${String(Math.abs(diffMonths))} month${Math.abs(diffMonths) !== 1 ? "s" : ""} ${
      diffMonths < 0 ? "ago" : "from now"
    }`;
  }

  return formatDisplayDate(value);
}

/**
 * Get a time-of-day appropriate greeting message.
 *
 * @returns {string} A greeting message based on the current time of day.
 */
export function getTimeOfDay(): string {
  const hour = temporalNowHour();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}
