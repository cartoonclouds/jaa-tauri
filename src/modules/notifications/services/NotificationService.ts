import {
  type NotificationCreatePayload,
  type NotificationRepository,
  type NotificationUpdatePayload,
} from "@modules/notifications/repositories/NotificationRepository";

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: NotificationCreatePayload) {
    if (!payload.title.trim()) {
      throw new Error("Notification title is required");
    }
    if (!payload.body.trim()) {
      throw new Error("Notification body is required");
    }

    return this.repository.create({
      ...payload,
      title: payload.title.trim(),
      body: payload.body.trim(),
      severity: payload.severity ?? "info",
      isRead: payload.isRead ?? false,
    });
  }

  update(payload: NotificationUpdatePayload) {
    return this.repository.update({
      ...payload,
      title: payload.title?.trim(),
      body: payload.body?.trim(),
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
