import type { Notification } from "@modules/notifications/domain/entities/Notification";

export function mapNotificationRowToEntity(
  row: Record<string, unknown>,
): Notification {
  return {
    id: String(row.id),
    applicationId: (row.application_id as string | null) ?? null,
    eventId: (row.event_id as string | null) ?? null,
    severity: (row.severity as Notification["severity"]) ?? "info",
    title: String(row.title),
    body: String(row.body),
    isRead: Number(row.is_read ?? 0) === 1,
    scheduledFor: (row.scheduled_for as string | null) ?? null,
    sentAt: (row.sent_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
