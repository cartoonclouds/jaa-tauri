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

/** Client-side filter fields used in the profile datatable. */
export const profileGlobalFilterFields: string[] = [
  "fullName",
  "email",
  "headline",
];

/** Search input placeholder text for the profile datatable. */
export const profileSearchPlaceholder = "Search profiles";
