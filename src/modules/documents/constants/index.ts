/** SQL columns included in document repository text search. */
export const DOCUMENT_SEARCH_FIELDS = ["title", "kind", "file_path"] as const;

/**
 * Type alias for document search field.
 */
export type DocumentSearchField = (typeof DOCUMENT_SEARCH_FIELDS)[number];

/** Client-side filter fields used in the documents datatable. */
export const documentsGlobalFilterFields: string[] = [
  "title",
  "kind",
  "filePath",
];

/** Search input placeholder text for the documents datatable. */
export const documentsSearchPlaceholder = "Search documents";
