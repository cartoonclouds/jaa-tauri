import type { DatatablePageQuery } from "@shared/types";

import { NotificationSchema } from "@modules/notifications/domain/zod/notification.schema";
import {
  type INotificationRepository,
  type NotificationCreatePayload,
  type NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";

const NotificationContentSchema = NotificationSchema.pick({
  title: true,
  body: true,
});
const NotificationContentUpdateSchema = NotificationContentSchema.partial();

/**
 * Implements notification service.
 */
export class NotificationService {
  constructor(private readonly repository: INotificationRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  create(payload: NotificationCreatePayload) {
    const parsedContent = NotificationContentSchema.safeParse({
      title: payload.title.trim(),
      body: payload.body.trim(),
    });

    if (!parsedContent.success) {
      throw new Error(
        parsedContent.error.issues[0]?.message ??
          "Error creating notification content",
      );
    }

    return this.repository.create({
      ...payload,
      title: parsedContent.data.title,
      body: parsedContent.data.body,
      severity: payload.severity,
      isRead: payload.isRead,
    });
  }

  update(payload: NotificationUpdatePayload) {
    const contentToValidate = {
      ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
      ...(payload.body !== undefined ? { body: payload.body.trim() } : {}),
    };

    const parsedContent =
      NotificationContentUpdateSchema.safeParse(contentToValidate);

    if (!parsedContent.success) {
      throw new Error(
        parsedContent.error.issues[0]?.message ??
          "Error updating notification content",
      );
    }

    return this.repository.update({
      ...payload,
      ...parsedContent.data,
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
