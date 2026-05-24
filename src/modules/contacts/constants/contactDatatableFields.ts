/** SQL columns included in contact repository text search. */
export const CONTACT_SEARCH_FIELDS = ["full_name", "email", "type"] as const;

/**
 * Type alias for contact search field.
 */
export type ContactSearchField = (typeof CONTACT_SEARCH_FIELDS)[number];
