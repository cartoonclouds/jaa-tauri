import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { mapNotificationRowToEntity } from "@modules/notifications/application/mappers/mapNotificationRow";
import { NOTIFICATION_SEARCH_FIELDS } from "@modules/notifications/constants";
import { NotificationRepositoryCreateSchema } from "@modules/notifications/domain/zod/notification.schema";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

/**
 * Type alias for notification create payload.
 */
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
/**
 * Type alias for notification update payload.
 */
export type NotificationUpdatePayload = Partial<NotificationCreatePayload> & {
  id: string;
};

/**
 * Defines inotification repository.
 */
export interface INotificationRepository extends IRepository<
  Notification,
  NotificationCreatePayload,
  NotificationUpdatePayload
> {
  listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Notification>>;
}

/**
 * Implements notification repository.
 */
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Notification[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "notifications",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );
    return rows.map((row) => mapNotificationRowToEntity(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Notification>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      NOTIFICATION_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM notifications
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM notifications",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM notifications
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM notifications
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapNotificationRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: NotificationCreatePayload): Promise<string> {
    const parseResult = NotificationRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new Error("Notification title and body are required");
    }

    const title = parseResult.data.title.trim();
    const body = parseResult.data.body.trim();
    if (!title || !body) {
      throw new Error("Notification title and body are required");
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO notifications (id, application_id, event_id, severity, title, body, is_read, scheduled_for, sent_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        parseResult.data.applicationId ?? null,
        parseResult.data.eventId ?? null,
        parseResult.data.severity ?? "info",
        title,
        body,
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
