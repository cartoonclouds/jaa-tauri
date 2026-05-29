/** SQL columns included in setting repository text search. */
export const SETTING_SEARCH_FIELDS = ["theme", "locale"] as const;

/**
 * Type alias for setting search field.
 */
export type SettingSearchField = (typeof SETTING_SEARCH_FIELDS)[number];

/** Client-side filter fields used in the settings datatable. */
export const settingsGlobalFilterFields: string[] = ["theme", "locale"];

/** Search input placeholder text for the settings datatable. */
export const settingsSearchPlaceholder = "Search settings";
