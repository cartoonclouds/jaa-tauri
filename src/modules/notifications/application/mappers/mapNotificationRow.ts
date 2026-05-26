import type { Notification } from "@modules/notifications/domain/entities/Notification";

import {
  fromDbBoolean,
  mapAuditTimestamps,
  mapOptionalRowDate,
  normalizeAliasedLiteralValue,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

const NOTIFICATION_SEVERITY_VALUES = [
  "info",
  "success",
  "warning",
  "error",
] as const;

/**
 * Map a raw database row into a typed notification entity.
 */
export function mapNotificationRowToEntity(
  row: Record<string, unknown>,
): Notification {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    applicationId: toNullableString(row.application_id),
    eventId: toNullableString(row.event_id),
    severity: normalizeAliasedLiteralValue(
      row.severity,
      NOTIFICATION_SEVERITY_VALUES,
      { warn: "warning" },
      "info",
    ),
    title: toRequiredString(row.title),
    body: toRequiredString(row.body),
    isRead: fromDbBoolean(row.is_read, false),
    scheduledFor: mapOptionalRowDate(row.scheduled_for),
    sentAt: mapOptionalRowDate(row.sent_at),
    ...timestamps,
  };
}
