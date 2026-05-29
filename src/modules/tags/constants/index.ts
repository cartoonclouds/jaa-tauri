/** SQL columns included in tag repository text search. */
export const TAG_SEARCH_FIELDS = ["name", "color"] as const;

/**
 * Type alias for tag search field.
 */
export type TagSearchField = (typeof TAG_SEARCH_FIELDS)[number];

/** Client-side filter fields used in the tags datatable. */
export const tagsGlobalFilterFields: string[] = ["name", "color"];

/** Search input placeholder text for the tags datatable. */
export const tagsSearchPlaceholder = "Search tags";
