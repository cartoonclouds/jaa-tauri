export const DOCUMENT_SEARCH_FIELDS = ["title", "kind", "file_path"] as const;

export type DocumentSearchField = (typeof DOCUMENT_SEARCH_FIELDS)[number];
