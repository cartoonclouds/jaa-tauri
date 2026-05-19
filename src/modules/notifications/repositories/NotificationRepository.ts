import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Notification } from "@modules/notifications/domain/entities/Notification";

export type NotificationCreatePayload = Pick<
  Notification,
  | "applicationId"
  | "eventId"
  | "severity"
  | "title"
  | "body"
  | "isRead"
  | "scheduledFor"
  | "sentAt"
>;
export type NotificationUpdatePayload = Partial<NotificationCreatePayload> & {
  id: string;
};

export class NotificationRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Notification[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM notifications ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
      id: String(row.id),
      applicationId: (row.application_id as string | null) ?? null,
      eventId: (row.event_id as string | null) ?? null,
      severity: row.severity as Notification["severity"],
      title: String(row.title),
      body: String(row.body),
      isRead: Number(row.is_read ?? 0) === 1,
      scheduledFor: (row.scheduled_for as string | null) ?? null,
      sentAt: (row.sent_at as string | null) ?? null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  }

  async create(payload: NotificationCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO notifications (id, application_id, event_id, severity, title, body, is_read, scheduled_for, sent_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        payload.applicationId ?? null,
        payload.eventId ?? null,
        payload.severity,
        payload.title,
        payload.body,
        payload.isRead ? 1 : 0,
        payload.scheduledFor ?? null,
        payload.sentAt ?? null,
      ],
    );
    return id;
  }

  async update(payload: NotificationUpdatePayload): Promise<void> {
    await this.db.execute(
      `UPDATE notifications
       SET severity = COALESCE($1, severity),
           title = COALESCE($2, title),
           body = COALESCE($3, body),
           is_read = COALESCE($4, is_read),
           scheduled_for = COALESCE($5, scheduled_for),
           sent_at = COALESCE($6, sent_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        payload.severity ?? null,
        payload.title ?? null,
        payload.body ?? null,
        payload.isRead === undefined ? null : payload.isRead ? 1 : 0,
        payload.scheduledFor ?? null,
        payload.sentAt ?? null,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM notifications WHERE id = $1", [id]);
  }
}
