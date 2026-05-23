export const SETTING_SEARCH_FIELDS = ["theme", "locale"] as const;

export type SettingSearchField = (typeof SETTING_SEARCH_FIELDS)[number];
