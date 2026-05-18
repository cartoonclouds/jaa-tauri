/**
 * Application settings and preferences.
 *
 * These are lightweight user preferences stored in Tauri Store, not SQLite.
 * Use for theme, window state, UI preferences, etc.
 */

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  developerMode: boolean;
  recentSearches: string[];
  tableColumnVisibility: Record<string, boolean>;
  onboardingCompleted: boolean;
  userProfile: UserProfile;
}

export interface UserProfile {
  fullName: string;
  email: string;
  targetRole: string;
  desiredSalary: number | null;
  salaryCurrency: string;
  preferredLocations: string[];
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
  skills: string[];
  linkedInUrl: string;
  githubUrl: string;
  workEligibility: string;
  noticePeriodDays: number | null;
  interviewAvailability: string;
}

export interface ThemeSettings {
  theme: "light" | "dark" | "auto";
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
