import type { TemporalDateTime } from "@shared/utils/temporal";

import { toDate, toNullableDate } from "@shared/utils/toDate";

/**
 * Minimal row shape that includes persisted audit timestamp columns.
 */
export interface AuditTimestampRow {
  created_at: unknown;
  updated_at: unknown;
}

/**
 * Maps a persisted date-like field into a required Date value.
 */
export function mapRequiredRowDate(value: unknown): TemporalDateTime {
  return toDate(value);
}

/**
 * Maps a persisted date-like field into an optional Date value.
 */
export function mapOptionalRowDate(value: unknown): TemporalDateTime | null {
  return toNullableDate(value);
}

/**
 * Maps common audit timestamp columns to entity-friendly field names.
 */
export function mapAuditTimestamps(row: AuditTimestampRow): {
  createdAt: TemporalDateTime;
  updatedAt: TemporalDateTime;
} {
  return {
    createdAt: mapRequiredRowDate(row.created_at),
    updatedAt: mapRequiredRowDate(row.updated_at),
  };
}
