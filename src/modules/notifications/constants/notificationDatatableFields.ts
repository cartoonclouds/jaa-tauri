export const NOTIFICATION_SEARCH_FIELDS = [
  "title",
  "body",
  "severity",
] as const;

/**
 * Type alias for notification search field.
 */
export type NotificationSearchField =
  (typeof NOTIFICATION_SEARCH_FIELDS)[number];








