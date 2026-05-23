export const TAG_SEARCH_FIELDS = ["name", "color"] as const;

export type TagSearchField = (typeof TAG_SEARCH_FIELDS)[number];
