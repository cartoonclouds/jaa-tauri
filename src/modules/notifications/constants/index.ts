/** SQL columns included in notification repository text search. */
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

/** Client-side filter fields used in the notifications datatable. */
export const notificationsGlobalFilterFields: string[] = [
  "title",
  "body",
  "severity",
];

/** Search input placeholder text for the notifications datatable. */
export const notificationsSearchPlaceholder = "Search notifications";
