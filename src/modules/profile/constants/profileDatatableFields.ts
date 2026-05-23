export const PROFILE_SEARCH_FIELDS = [
  "full_name",
  "email",
  "headline",
] as const;

export type ProfileSearchField = (typeof PROFILE_SEARCH_FIELDS)[number];
