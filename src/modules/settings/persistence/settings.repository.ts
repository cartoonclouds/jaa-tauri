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

import { logError } from "@infra/logging/appLogger";
import { ValidationError } from "@shared/domain/errors";
import { normalizeAliasedLiteralValue } from "@shared/utils/database-mapping/normalizationUtils";
import {
  fromDbBoolean,
  parseBooleanRecordValue,
  toDbBooleanInt,
} from "@shared/utils/database-mapping/persistenceValueUtils";
import { toErrorMessage } from "@shared/utils/error";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";
import { parseStringArray } from "@shared/utils/parse";
import { z } from "zod";

const SettingsInputSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  statsVisibility: z.record(
    z.union([
      z.boolean(),
      z.object({
        visible: z.boolean(),
        sortOrder: z.number().int().nullable().optional(),
      }),
    ]),
  ),
  onboardingCompleted: z.boolean(),
});

const STORE_KEY = "app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "auto",
  notificationsEnabled: true,
  developerMode: false,
  recentSearches: [],
  tableColumnVisibility: {},
  statsVisibility: {},
  onboardingCompleted: false,
};

const THEME_VALUES = ["light", "dark", "auto"] as const;

/**
 * Raw settings row shape returned by the persistence layer.
 */
type SettingsRow = Record<string, unknown>;

let database: DatabaseDriver | null = null;

/**
 * Creates a defensive deep-ish clone of mutable settings fields.
 */
function cloneSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    recentSearches: [...settings.recentSearches],
    tableColumnVisibility: { ...settings.tableColumnVisibility },
    statsVisibility: { ...settings.statsVisibility },
  };
}

/**
 * Normalizes persisted theme values to the supported app enum.
 */
function normalizeTheme(value: unknown): AppSettings["theme"] {
  return normalizeAliasedLiteralValue(
    value,
    THEME_VALUES,
    { system: "auto" },
    DEFAULT_SETTINGS.theme,
  );
}

/**
 * Maps a raw database row into a normalized AppSettings object.
 */
function mapRowToSettings(row: SettingsRow): AppSettings {
  return {
    theme: normalizeTheme(row.theme),
    notificationsEnabled: fromDbBoolean(
      row.notifications_enabled,
      DEFAULT_SETTINGS.notificationsEnabled,
    ),
    developerMode: fromDbBoolean(
      row.developer_mode,
      DEFAULT_SETTINGS.developerMode,
    ),
    recentSearches: parseStringArray(
      row.recent_searches,
      DEFAULT_SETTINGS.recentSearches,
    ),
    tableColumnVisibility: parseBooleanRecordValue(
      row.table_column_visibility,
      DEFAULT_SETTINGS.tableColumnVisibility,
    ),
    statsVisibility: parseStatsVisibilityValue(row.stats_visibility),
    onboardingCompleted: fromDbBoolean(
      row.onboarding_completed,
      DEFAULT_SETTINGS.onboardingCompleted,
    ),
  };
}

/**
 * Parses the stored stats visibility JSON with backward compatibility.
 */
function parseStatsVisibilityValue(
  value: unknown,
): AppSettings["statsVisibility"] {
  if (typeof value !== "string") {
    return { ...DEFAULT_SETTINGS.statsVisibility };
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS.statsVisibility };
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<
      AppSettings["statsVisibility"]
    >((accumulator, [metricId, rawEntry]) => {
      if (typeof rawEntry === "boolean") {
        accumulator[metricId] = rawEntry;
        return accumulator;
      }

      if (
        rawEntry &&
        typeof rawEntry === "object" &&
        !Array.isArray(rawEntry)
      ) {
        const candidate = rawEntry as Record<string, unknown>;
        if (typeof candidate.visible === "boolean") {
          const rawSortOrder = candidate.sortOrder;
          const normalizedSortOrder =
            typeof rawSortOrder === "number" && Number.isInteger(rawSortOrder)
              ? rawSortOrder
              : null;

          accumulator[metricId] = {
            visible: candidate.visible,
            sortOrder: normalizedSortOrder,
          };
        }
      }

      return accumulator;
    }, {});
  } catch {
    return { ...DEFAULT_SETTINGS.statsVisibility };
  }
}

/**
 * Resolves and memoizes the active settings database driver.
 */
function getDatabase(): DatabaseDriver {
  if (database) {
    return database;
  }

  const db = getNuxtDatabase();
  database = db;

  return db;
}

/**
 * Inserts or updates the single persisted settings row.
 */
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
      recent_searches,
      table_column_visibility,
      stats_visibility,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      notifications_enabled = excluded.notifications_enabled,
      developer_mode = excluded.developer_mode,
      recent_searches = excluded.recent_searches,
      table_column_visibility = excluded.table_column_visibility,
      stats_visibility = excluded.stats_visibility,
      onboarding_completed = excluded.onboarding_completed,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      STORE_KEY,
      settings.theme,
      "en-GB",
      toDbBooleanInt(settings.notificationsEnabled),
      toDbBooleanInt(settings.developerMode),
      JSON.stringify(settings.recentSearches),
      JSON.stringify(settings.tableColumnVisibility),
      JSON.stringify(settings.statsVisibility),
      toDbBooleanInt(settings.onboardingCompleted),
    ],
  );
}

/**
 * Reads the persisted settings row or seeds defaults when missing.
 */
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
  if (rows.length === 0) {
    const defaults = cloneSettings(DEFAULT_SETTINGS);
    await upsertSettingsRow(db, defaults);
    return defaults;
  }

  const row = rows[0];

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
    logError(
      "Failed to initialize settings persistence:",
      toErrorMessage(error),
    );
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
    console.error("settings.persistence.setSettings validation failed", {
      updated,
      error: parseResult.error,
    });
    throw new ValidationError(
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
    console.error("settings.persistence.setSetting validation failed", {
      key,
      value,
      updated,
      error: settingsParse.error,
    });
    throw new ValidationError(
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
    tableColumnVisibility: settings.tableColumnVisibility,
    statsVisibility: settings.statsVisibility,
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
