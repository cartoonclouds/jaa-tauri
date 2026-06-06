/**
/** Severity level used for notification display and filtering. */
export type NotificationSeverity = "info" | "warning" | "success" | "error";

/**
 * All mutable data fields shared across notification read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface NotificationBase {
  /** Related application identifier, when available. */
  applicationId: string | null;
  /** Related event identifier, when available. */
  eventId: string | null;
  /** Severity classification used for display and filtering. */
  severity: NotificationSeverity;
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Whether the notification has been read. */
  isRead: boolean;
  /** Scheduled delivery time, if any. */
  scheduledFor: Date | null;
  /** Timestamp when the notification was sent. */
  sentAt: Date | null;
}

/**
 * Notification aggregate used by the application.
 * Extends {@link NotificationBase} with system-managed fields.
 */
export interface Notification extends NotificationBase {
  /** Unique notification identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a notification.
 * Derived from {@link NotificationBase}: `title` and `body` are required;
 * all other base fields are optional.
 */
export type CreateNotificationInput = Pick<NotificationBase, "title" | "body"> &
  Partial<Omit<NotificationBase, "title" | "body">>;
