/**
 * Application settings and preferences.
 *
 * These preferences are persisted through the app's configured DatabaseDriver.
 * Use for theme, UI preferences, and other lightweight app state.
 */

/**
 * Persisted application settings stored by the preferences layer.
 */
export interface AppSettings {
  /** Color theme preference. */
  theme: "light" | "dark" | "auto";
  /** Whether notifications are enabled. */
  notificationsEnabled: boolean;
  /** Whether developer mode is enabled. */
  developerMode: boolean;
  /** Recently used search terms. */
  recentSearches: string[];
  /** Column visibility map keyed by table or datatable identifier. */
  tableColumnVisibility: Record<string, boolean>;
  /** Whether the onboarding flow has been completed. */
  onboardingCompleted: boolean;
}

/**
 * Theme-specific settings subset.
 */
export interface ThemeSettings {
  /** Color theme preference. */
  theme: "light" | "dark" | "auto";
}

/**
 * UI-specific settings subset.
 */
export interface UiPreferences {
  /** Column visibility map keyed by table or datatable identifier. */
  tableColumnVisibility: Record<string, boolean>;
}

/**
 * Notification-related settings subset.
 */
export interface NotificationSettings {
  /** Whether notifications are enabled. */
  notificationsEnabled: boolean;
}

/**
 * Developer-only settings subset.
 */
export interface DeveloperSettings {
  /** Whether developer mode is enabled. */
  developerMode: boolean;
}

/**
 * Keys available on the application settings object.
 */
export type SettingsKey = keyof AppSettings;



