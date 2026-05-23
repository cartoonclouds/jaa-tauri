import type { Notification } from "@modules/notifications/domain/entities/Notification";

import { toDate, toNullableDate } from "@shared/utils/toDate";

/**
 * Map a raw database row into a typed notification entity.
 */
export function mapNotificationRowToEntity(
  row: Record<string, unknown>,
): Notification {
  const severity = row.severity;

  return {
    id: String(row.id),
    applicationId: (row.application_id as string | null) ?? null,
    eventId: (row.event_id as string | null) ?? null,
    severity:
      severity === "info" ||
      severity === "success" ||
      severity === "warning" ||
      severity === "error"
        ? severity
        : severity === "warn"
          ? "warning"
          : "info",
    title: String(row.title),
    body: String(row.body),
    isRead: Number(row.is_read ?? 0) === 1,
    scheduledFor: toNullableDate(row.scheduled_for),
    sentAt: toNullableDate(row.sent_at),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}



