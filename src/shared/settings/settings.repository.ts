/**
 * Settings repository.
 *
 * Typed persistence layer over the configured DatabaseDriver.
 * Handles all low-level get/set operations with type safety.
 */

import type {
  AppSettings,
  DeveloperSettings,
  NotificationSettings,
  ThemeSettings,
  UiPreferences,
} from "./types";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { parseStringArray } from "@shared/utils/parse";
import { z } from "zod";

const SettingsInputSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  sidebarCollapsed: z.boolean(),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  onboardingCompleted: z.boolean(),
});

import { useNuxtApp } from "nuxt/app";
const STORE_KEY = "app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "auto",
  sidebarCollapsed: false,
  notificationsEnabled: true,
  developerMode: false,
  recentSearches: [],
  tableColumnVisibility: {},
  onboardingCompleted: false,
};

type SettingsRow = Record<string, unknown>;

let database: DatabaseDriver | null = null;

function cloneSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    recentSearches: [...settings.recentSearches],
    tableColumnVisibility: { ...settings.tableColumnVisibility },
  };
}

function toInt(value: boolean): number {
  return value ? 1 : 0;
}

function parseBooleanRecord(
  value: unknown,
  fallback: Record<string, boolean>,
): Record<string, boolean> {
  if (typeof value !== "string") {
    return { ...fallback };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...fallback };
    }

    return Object.entries(parsed).reduce<Record<string, boolean>>(
      (accumulator, [key, recordValue]) => {
        accumulator[key] = Boolean(recordValue);
        return accumulator;
      },
      {},
    );
  } catch {
    return { ...fallback };
  }
}

function normalizeTheme(value: unknown): AppSettings["theme"] {
  if (value === "light" || value === "dark" || value === "auto") {
    return value;
  }

  if (value === "system") {
    return "auto";
  }

  return DEFAULT_SETTINGS.theme;
}

function mapRowToSettings(row: SettingsRow): AppSettings {
  return {
    theme: normalizeTheme(row.theme),
    sidebarCollapsed:
      Number(
        row.sidebar_collapsed ?? Number(DEFAULT_SETTINGS.sidebarCollapsed),
      ) === 1,
    notificationsEnabled:
      Number(
        row.notifications_enabled ??
          Number(DEFAULT_SETTINGS.notificationsEnabled),
      ) === 1,
    developerMode:
      Number(row.developer_mode ?? Number(DEFAULT_SETTINGS.developerMode)) ===
      1,
    recentSearches: parseStringArray(
      row.recent_searches,
      DEFAULT_SETTINGS.recentSearches,
    ),
    tableColumnVisibility: parseBooleanRecord(
      row.table_column_visibility,
      DEFAULT_SETTINGS.tableColumnVisibility,
    ),
    onboardingCompleted:
      Number(
        row.onboarding_completed ??
          Number(DEFAULT_SETTINGS.onboardingCompleted),
      ) === 1,
  };
}

function getDatabase(): DatabaseDriver {
  if (database) {
    return database;
  }

  const { $database } = useNuxtApp();
  database = $database;

  return database;
}

async function upsertSettingsRow(
  db: DatabaseDriver,
  settings: AppSettings,
): Promise<void> {
  await db.execute(
    `
    INSERT INTO settings (
      id,
      theme,
      locale,
      notifications_enabled,
      developer_mode,
      sidebar_collapsed,
      recent_searches,
      table_column_visibility,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      notifications_enabled = excluded.notifications_enabled,
      developer_mode = excluded.developer_mode,
      sidebar_collapsed = excluded.sidebar_collapsed,
      recent_searches = excluded.recent_searches,
      table_column_visibility = excluded.table_column_visibility,
      onboarding_completed = excluded.onboarding_completed,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      STORE_KEY,
      settings.theme,
      "en-GB",
      toInt(settings.notificationsEnabled),
      toInt(settings.developerMode),
      toInt(settings.sidebarCollapsed),
      JSON.stringify(settings.recentSearches),
      JSON.stringify(settings.tableColumnVisibility),
      toInt(settings.onboardingCompleted),
    ],
  );
}

async function readSettingsRow(db: DatabaseDriver): Promise<AppSettings> {
  const rows = await db.select<SettingsRow>(
    `
    SELECT
      *
    FROM settings
    WHERE id = $1
    LIMIT 1
    `,
    [STORE_KEY],
  );
  const row = rows[0];

  if (!row) {
    const defaults = cloneSettings(DEFAULT_SETTINGS);
    await upsertSettingsRow(db, defaults);
    return defaults;
  }

  return mapRowToSettings(row);
}

/**
 * Initialize shared settings persistence.
 * Must be called once at app startup.
 */
export async function initializeSettingsStore(
  driver?: DatabaseDriver,
): Promise<void> {
  if (driver) {
    database = driver;
  }
  const db = getDatabase();

  try {
    await readSettingsRow(db);
  } catch (error) {
    console.error("Failed to initialize settings persistence:", error);
    throw error;
  }
}

/**
 * Get all application settings.
 */
export async function getSettings(): Promise<AppSettings> {
  const db = getDatabase();
  return await readSettingsRow(db);
}

/**
 * Set entire settings object.
 */
export async function setSettings(
  settings: Partial<AppSettings>,
): Promise<void> {
  const db = getDatabase();
  const current = await getSettings();
  const updated = { ...current, ...settings };

  const parseResult = SettingsInputSchema.safeParse(updated);
  if (!parseResult.success) {
    throw new Error(
      "Settings validation failed: " +
        JSON.stringify(parseResult.error.format()),
    );
  }

  await upsertSettingsRow(db, updated);
}

/**
 * Get a specific setting by key.
 */
export async function getSetting<K extends keyof AppSettings>(
  key: K,
): Promise<AppSettings[K]> {
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
  const current = await getSettings();
  const updated = { ...current, [key]: value };
  const db = getDatabase();

  const settingsParse = SettingsInputSchema.safeParse(updated);
  if (!settingsParse.success) {
    throw new Error(
      "Settings validation failed: " +
        JSON.stringify(settingsParse.error.format()),
    );
  }

  await upsertSettingsRow(db, updated);
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
 * Reset all settings to defaults.
 */
export async function resetSettings(): Promise<void> {
  const db = getDatabase();
  await upsertSettingsRow(db, cloneSettings(DEFAULT_SETTINGS));
}

export { DEFAULT_SETTINGS };
