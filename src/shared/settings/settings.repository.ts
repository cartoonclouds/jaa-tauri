/**
 * Settings repository.
 *
 * Typed persistence layer for Tauri Store.
 * Handles all low-level get/set operations with type safety.
 */

import type {
  AppSettings,
  DeveloperSettings,
  NotificationSettings,
  ThemeSettings,
  UiPreferences,
  UserProfile,
} from "./types";

import { Store } from "@tauri-apps/plugin-store";

const STORE_KEY = "app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "auto",
  sidebarCollapsed: false,
  notificationsEnabled: true,
  developerMode: false,
  recentSearches: [],
  tableColumnVisibility: {},
  onboardingCompleted: false,
  userProfile: {
    fullName: "",
    email: "",
    targetRole: "",
    desiredSalary: null,
    salaryCurrency: "USD",
    preferredLocations: [],
    remotePreference: "flexible",
    skills: [],
    linkedInUrl: "",
    githubUrl: "",
    workEligibility: "",
    noticePeriodDays: null,
    interviewAvailability: "",
  },
};

let store: Store | null = null;

/**
 * Initialize the settings store.
 * Must be called once at app startup.
 */
export async function initializeSettingsStore(): Promise<void> {
  if (store) return;

  try {
    store = await Store.load("settings.json", {
      autoSave: true,
      defaults: DEFAULT_SETTINGS as unknown as Record<string, unknown>,
    });
  } catch (error) {
    console.error("Failed to initialize settings store:", error);
    throw error;
  }
}

/**
 * Get all application settings.
 */
export async function getSettings(): Promise<AppSettings> {
  if (!store) throw new Error("Settings store not initialized");

  const stored = await store.get<AppSettings>(STORE_KEY);
  return stored ?? DEFAULT_SETTINGS;
}

/**
 * Set entire settings object.
 */
export async function setSettings(
  settings: Partial<AppSettings>,
): Promise<void> {
  if (!store) throw new Error("Settings store not initialized");

  const current = await getSettings();
  const updated = { ...current, ...settings };
  await store.set(STORE_KEY, updated);
}

/**
 * Get a specific setting by key.
 */
export async function getSetting<K extends keyof AppSettings>(
  key: K,
): Promise<AppSettings[K]> {
  if (!store) throw new Error("Settings store not initialized");

  const settings = await getSettings();
  return settings[key];
}

/**
 * Set a specific setting by key.
 */
export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): Promise<void> {
  if (!store) throw new Error("Settings store not initialized");

  const current = await getSettings();
  current[key] = value;
  await store.set(STORE_KEY, current);
}

/**
 * Get theme settings.
 */
export async function getThemeSettings(): Promise<ThemeSettings> {
  const theme = await getSetting("theme");
  return { theme };
}

/**
 * Set theme settings.
 */
export async function setThemeSettings(settings: ThemeSettings): Promise<void> {
  await setSetting("theme", settings.theme);
}

/**
 * Get UI preferences.
 */
export async function getUiPreferences(): Promise<UiPreferences> {
  const settings = await getSettings();
  return {
    sidebarCollapsed: settings.sidebarCollapsed,
    tableColumnVisibility: settings.tableColumnVisibility,
  };
}

/**
 * Set UI preferences.
 */
export async function setUiPreferences(prefs: UiPreferences): Promise<void> {
  await setSettings(prefs);
}

/**
 * Get notification settings.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const notificationsEnabled = await getSetting("notificationsEnabled");
  return { notificationsEnabled };
}

/**
 * Set notification settings.
 */
export async function setNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  await setSetting("notificationsEnabled", settings.notificationsEnabled);
}

/**
 * Get developer settings.
 */
export async function getDeveloperSettings(): Promise<DeveloperSettings> {
  const developerMode = await getSetting("developerMode");
  return { developerMode };
}

/**
 * Set developer settings.
 */
export async function setDeveloperSettings(
  settings: DeveloperSettings,
): Promise<void> {
  await setSetting("developerMode", settings.developerMode);
}

/**
 * Add a recent search.
 */
export async function addRecentSearch(query: string): Promise<void> {
  const current = await getSetting("recentSearches");
  const updated = [query, ...current.filter((s) => s !== query)].slice(0, 10); // Keep last 10
  await setSetting("recentSearches", updated);
}

/**
 * Clear recent searches.
 */
export async function clearRecentSearches(): Promise<void> {
  await setSetting("recentSearches", []);
}

/**
 * Set table column visibility.
 */
export async function setTableColumnVisibility(
  visibility: Record<string, boolean>,
): Promise<void> {
  await setSetting("tableColumnVisibility", visibility);
}

/**
 * Get table column visibility.
 */
export async function getTableColumnVisibility(): Promise<
  Record<string, boolean>
> {
  return await getSetting("tableColumnVisibility");
}

/**
 * Get onboarding completion status.
 */
export async function getOnboardingCompleted(): Promise<boolean> {
  return await getSetting("onboardingCompleted");
}

/**
 * Set onboarding completion status.
 */
export async function setOnboardingCompleted(value: boolean): Promise<void> {
  await setSetting("onboardingCompleted", value);
}

/**
 * Get user profile.
 */
export async function getUserProfile(): Promise<UserProfile> {
  return await getSetting("userProfile");
}

/**
 * Set user profile.
 */
export async function setUserProfile(profile: UserProfile): Promise<void> {
  await setSetting("userProfile", profile);
}

/**
 * Reset all settings to defaults.
 */
export async function resetSettings(): Promise<void> {
  if (!store) throw new Error("Settings store not initialized");

  await store.set(STORE_KEY, DEFAULT_SETTINGS);
}

export { DEFAULT_SETTINGS };
