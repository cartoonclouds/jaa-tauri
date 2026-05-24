/** SQL columns included in profile repository text search. */
export const PROFILE_SEARCH_FIELDS = [
  "full_name",
  "email",
  "headline",
] as const;

/**
 * Type alias for profile search field.
 */
export type ProfileSearchField = (typeof PROFILE_SEARCH_FIELDS)[number];
