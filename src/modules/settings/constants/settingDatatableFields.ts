export const SETTING_SEARCH_FIELDS = ["theme", "locale"] as const;

/**
 * Type alias for setting search field.
 */
export type SettingSearchField = (typeof SETTING_SEARCH_FIELDS)[number];








