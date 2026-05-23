export const CONTACT_SEARCH_FIELDS = ["full_name", "email", "type"] as const;

export type ContactSearchField = (typeof CONTACT_SEARCH_FIELDS)[number];
