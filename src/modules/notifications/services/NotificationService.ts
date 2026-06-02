import type { DatatablePageQuery } from "@shared/types";

import { NotificationSchema } from "@modules/notifications/domain/zod/notification.schema";
import {
  type INotificationRepository,
  type NotificationCreatePayload,
  type NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";
import { parseTrimmedWithSchema } from "@shared/utils/zodValidation";

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
    const parsedContent = parseTrimmedWithSchema(
      NotificationContentSchema,
      {
        title: payload.title,
        body: payload.body,
      },
      ["title", "body"],
      {
        fallbackMessage: "Error creating notification content",
        useFirstIssueMessage: true,
      },
    );

    return this.repository.create({
      ...payload,
      title: parsedContent.title,
      body: parsedContent.body,
      severity: payload.severity,
      isRead: payload.isRead,
    });
  }

  update(payload: NotificationUpdatePayload) {
    const contentToValidate = {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.body !== undefined ? { body: payload.body } : {}),
    };

    const parsedContent = parseTrimmedWithSchema(
      NotificationContentUpdateSchema,
      contentToValidate,
      ["title", "body"],
      {
        fallbackMessage: "Error updating notification content",
        useFirstIssueMessage: true,
      },
    );

    return this.repository.update({
      ...payload,
      ...parsedContent,
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
