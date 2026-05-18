/**
 * Application settings and preferences.
 *
 * These are lightweight user preferences stored in Tauri Store, not SQLite.
 * Use for theme, window state, UI preferences, etc.
 */

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  windowWidth: number;
  windowHeight: number;
  windowX?: number;
  windowY?: number;
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  developerMode: boolean;
  recentSearches: string[];
  tableColumnVisibility: Record<string, boolean>;
}

export interface ThemeSettings {
  theme: "light" | "dark" | "auto";
}

export interface WindowSettings {
  windowWidth: number;
  windowHeight: number;
  windowX?: number;
  windowY?: number;
}

export interface UiPreferences {
  sidebarCollapsed: boolean;
  tableColumnVisibility: Record<string, boolean>;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
}

export interface DeveloperSettings {
  developerMode: boolean;
}

export type SettingsKey = keyof AppSettings;
