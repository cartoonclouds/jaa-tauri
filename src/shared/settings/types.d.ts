/**
 * Application settings and preferences.
 *
 * These preferences are persisted through the app's configured DatabaseDriver.
 * Use for theme, UI preferences, and other lightweight app state.
 */

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  notificationsEnabled: boolean;
  developerMode: boolean;
  recentSearches: string[];
  tableColumnVisibility: Record<string, boolean>;
  onboardingCompleted: boolean;
}

export interface ThemeSettings {
  theme: "light" | "dark" | "auto";
}

export interface UiPreferences {
  tableColumnVisibility: Record<string, boolean>;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
}

export interface DeveloperSettings {
  developerMode: boolean;
}

export type SettingsKey = keyof AppSettings;
