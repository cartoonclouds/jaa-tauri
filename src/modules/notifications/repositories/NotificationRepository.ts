import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { toDate, toNullableDate } from "@shared/utils/toDate";

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

export interface INotificationRepository extends IRepository<
  Notification,
  NotificationCreatePayload,
  NotificationUpdatePayload
> {
  listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Notification>>;
}

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private mapNotificationRow(row: Record<string, unknown>): Notification {
    return {
      id: String(row.id),
      applicationId: (row.application_id as string | null) ?? null,
      eventId: (row.event_id as string | null) ?? null,
      severity: row.severity as Notification["severity"],
      title: String(row.title),
      body: String(row.body),
      isRead: Number(row.is_read ?? 0) === 1,
      scheduledFor: toNullableDate(row.scheduled_for),
      sentAt: toNullableDate(row.sent_at),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    };
  }

  async list(): Promise<Notification[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM notifications ORDER BY created_at DESC",
    );
    return rows.map((row) => this.mapNotificationRow(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Notification>> {
    const rows = Math.max(1, query.rows);
    const page = Math.max(0, query.page);
    const search = query.search?.trim() ?? "";
    const hasSearch = search.length > 0;

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM notifications WHERE title LIKE $1 OR body LIKE $1 OR severity LIKE $1",
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM notifications",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM notifications
           WHERE title LIKE $1 OR body LIKE $1 OR severity LIKE $1
           ORDER BY created_at DESC
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM notifications
           ORDER BY created_at DESC
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => this.mapNotificationRow(row)),
      total: totalRows[0]?.total ?? 0,
    };
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
        payload.scheduledFor ? payload.scheduledFor.toISOString() : null,
        payload.sentAt ? payload.sentAt.toISOString() : null,
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
        payload.scheduledFor ? payload.scheduledFor.toISOString() : null,
        payload.sentAt ? payload.sentAt.toISOString() : null,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM notifications WHERE id = $1", [id]);
  }
}
