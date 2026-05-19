import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Notification } from "@modules/notifications/domain/entities/Notification";

export async function listNotifications(
  db: DatabaseDriver,
): Promise<Notification[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM notifications ORDER BY created_at DESC",
  );

  return rows.map((row) => ({
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
  }));
}
