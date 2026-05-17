/**
 * Notification domain entity.
 * Represents a desktop notification with core properties.
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  sound?: string;
}

/**
 * Notification request for creating new notifications.
 */
export interface NotificationRequest {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  sound?: string;
}

/**
 * Notification result from sending.
 */
export interface NotificationResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Notification severity levels.
 */
export enum NotificationSeverity {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

/**
 * Rich notification with metadata.
 */
export interface RichNotification extends Notification {
  severity?: NotificationSeverity;
  timestamp?: Date;
  dismissible?: boolean;
}
