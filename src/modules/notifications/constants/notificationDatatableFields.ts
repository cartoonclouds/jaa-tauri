export const NOTIFICATION_SEARCH_FIELDS = [
  "title",
  "body",
  "severity",
] as const;

export type NotificationSearchField =
  (typeof NOTIFICATION_SEARCH_FIELDS)[number];
