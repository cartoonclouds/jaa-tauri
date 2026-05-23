/**
 * Notification aggregate used by the application.
 */
export interface Notification {
  /** Unique notification identifier. */
  id: string;
  /** Related application identifier, when available. */
  applicationId: string | null;
  /** Related event identifier, when available. */
  eventId: string | null;
  /** Severity classification used for display and filtering. */
  severity: "info" | "warning" | "success" | "error";
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
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a notification.
 */
export interface CreateNotificationInput {
  /** Related application identifier, when available. */
  applicationId?: string | null;
  /** Related event identifier, when available. */
  eventId?: string | null;
  /** Severity classification for the new notification. */
  severity?: Notification["severity"];
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
}



