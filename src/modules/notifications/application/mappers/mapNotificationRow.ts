import type { Notification } from "@modules/notifications/domain/entities/Notification";

import { normalizeAliasedLiteralValue } from "@shared/utils/normalizationUtils";
import { fromDbBoolean } from "@shared/utils/persistenceValueUtils";
import {
  mapAuditTimestamps,
  mapOptionalRowDate,
} from "@shared/utils/rowDateUtils";

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
    id: String(row.id),
    applicationId: (row.application_id as string | null) ?? null,
    eventId: (row.event_id as string | null) ?? null,
    severity: normalizeAliasedLiteralValue(
      row.severity,
      NOTIFICATION_SEVERITY_VALUES,
      { warn: "warning" },
      "info",
    ),
    title: String(row.title),
    body: String(row.body),
    isRead: fromDbBoolean(row.is_read, false),
    scheduledFor: mapOptionalRowDate(row.scheduled_for),
    sentAt: mapOptionalRowDate(row.sent_at),
    ...timestamps,
  };
}
