/** SQL columns included in document repository text search. */
export const DOCUMENT_SEARCH_FIELDS = ["title", "kind", "file_path"] as const;

/**
 * Type alias for document search field.
 */
export type DocumentSearchField = (typeof DOCUMENT_SEARCH_FIELDS)[number];
