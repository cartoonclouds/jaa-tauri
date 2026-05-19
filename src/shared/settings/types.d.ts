/**
 * Application settings and preferences.
 *
 * These preferences are persisted through the app's configured DatabaseDriver.
 * Use for theme, UI preferences, and onboarding profile data.
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
