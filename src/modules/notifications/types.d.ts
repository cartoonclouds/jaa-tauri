import type { Notification } from "@modules/notifications/domain/entities/Notification";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
  PartialUpdatePayload,
} from "@shared/types";

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
export type NotificationUpdatePayload =
  PartialUpdatePayload<NotificationCreatePayload>;

/**
 * Defines notification repository contract.
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
