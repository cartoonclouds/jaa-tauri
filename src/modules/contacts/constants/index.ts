/** SQL columns included in contact repository text search. */
export const CONTACT_SEARCH_FIELDS = ["full_name", "email", "type"] as const;

/**
 * Type alias for contact search field.
 */
export type ContactSearchField = (typeof CONTACT_SEARCH_FIELDS)[number];

/** Client-side filter fields used in the contacts datatable. */
export const contactsGlobalFilterFields: string[] = [
  "fullName",
  "type",
  "email",
];

/** Search input placeholder text for the contacts datatable. */
export const contactsSearchPlaceholder = "Search contacts";
