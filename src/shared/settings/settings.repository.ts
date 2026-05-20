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
  UserProfile,
} from "./types";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { parseStringArray } from "@shared/utils/parse";
import { z } from "zod";

const UserProfileInputSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  targetRole: z.string(),
  desiredSalary: z.number().int().nullable(),
  salaryCurrency: z.string(),
  preferredLocations: z.array(z.string()),
  remotePreference: z.enum(["remote", "hybrid", "onsite", "flexible"]),
  skills: z.array(z.string()),
  linkedInUrl: z.string(),
  githubUrl: z.string(),
  workEligibility: z.string(),
  noticePeriodDays: z.number().int().nullable(),
  interviewAvailability: z.string(),
});

const SettingsInputSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  sidebarCollapsed: z.boolean(),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  onboardingCompleted: z.boolean(),
  userProfile: UserProfileInputSchema,
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

type SettingsRow = Record<string, unknown>;

let database: DatabaseDriver | null = null;
let linkedProfileId: string | null = null;

function cloneUserProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    preferredLocations: [...profile.preferredLocations],
    skills: [...profile.skills],
  };
}

function cloneSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    recentSearches: [...settings.recentSearches],
    tableColumnVisibility: { ...settings.tableColumnVisibility },
    userProfile: cloneUserProfile(settings.userProfile),
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

function mapRowToUserProfile(row: SettingsRow): UserProfile {
  const defaultUserProfile = cloneUserProfile(DEFAULT_SETTINGS.userProfile);

  const preferredLocations =
    typeof row.profile_preferred_locations === "string"
      ? parseStringArray(
          row.profile_preferred_locations,
          defaultUserProfile.preferredLocations,
        )
      : typeof row.profile_location_text === "string"
        ? row.profile_location_text
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
        : defaultUserProfile.preferredLocations;

  const skills =
    typeof row.profile_skills === "string"
      ? parseStringArray(row.profile_skills, defaultUserProfile.skills)
      : defaultUserProfile.skills;

  return {
    ...defaultUserProfile,
    fullName:
      typeof row.profile_full_name === "string"
        ? row.profile_full_name
        : defaultUserProfile.fullName,
    email:
      typeof row.profile_email === "string"
        ? row.profile_email
        : defaultUserProfile.email,
    targetRole:
      typeof row.profile_headline === "string"
        ? row.profile_headline
        : defaultUserProfile.targetRole,
    desiredSalary:
      typeof row.profile_desired_salary === "number"
        ? row.profile_desired_salary
        : defaultUserProfile.desiredSalary,
    salaryCurrency:
      typeof row.profile_salary_currency === "string"
        ? row.profile_salary_currency
        : defaultUserProfile.salaryCurrency,
    linkedInUrl:
      typeof row.profile_linkedin_url === "string"
        ? row.profile_linkedin_url
        : defaultUserProfile.linkedInUrl,
    githubUrl:
      typeof row.profile_github_url === "string"
        ? row.profile_github_url
        : typeof row.profile_portfolio_url === "string"
          ? row.profile_portfolio_url
          : defaultUserProfile.githubUrl,
    preferredLocations,
    remotePreference:
      row.profile_remote_preference === "remote" ||
      row.profile_remote_preference === "hybrid" ||
      row.profile_remote_preference === "onsite" ||
      row.profile_remote_preference === "flexible"
        ? row.profile_remote_preference
        : defaultUserProfile.remotePreference,
    skills,
    workEligibility:
      typeof row.profile_work_eligibility === "string"
        ? row.profile_work_eligibility
        : defaultUserProfile.workEligibility,
    noticePeriodDays:
      typeof row.profile_notice_period_days === "number"
        ? row.profile_notice_period_days
        : defaultUserProfile.noticePeriodDays,
    interviewAvailability:
      typeof row.profile_interview_availability === "string"
        ? row.profile_interview_availability
        : defaultUserProfile.interviewAvailability,
  };
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
  linkedProfileId =
    typeof row.profile_id === "string" && row.profile_id.length > 0
      ? row.profile_id
      : null;

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
    userProfile: mapRowToUserProfile(row),
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
  profileId: string | null,
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
      profile_id,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      notifications_enabled = excluded.notifications_enabled,
      developer_mode = excluded.developer_mode,
      sidebar_collapsed = excluded.sidebar_collapsed,
      recent_searches = excluded.recent_searches,
      table_column_visibility = excluded.table_column_visibility,
      onboarding_completed = excluded.onboarding_completed,
      profile_id = excluded.profile_id,
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
      profileId,
    ],
  );
}

async function upsertProfileRow(
  db: DatabaseDriver,
  profile: UserProfile,
  profileId: string | null,
): Promise<string> {
  const id = profileId ?? crypto.randomUUID();

  await db.execute(
    `
    INSERT INTO profiles (
      id,
      full_name,
      email,
      phone,
      linkedin_url,
      github_url,
      portfolio_url,
      headline,
      summary,
      location_text,
      desired_salary,
      salary_currency,
      preferred_locations,
      remote_preference,
      skills,
      work_eligibility,
      notice_period_days,
      interview_availability,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      linkedin_url = excluded.linkedin_url,
      github_url = excluded.github_url,
      portfolio_url = excluded.portfolio_url,
      headline = excluded.headline,
      summary = excluded.summary,
      location_text = excluded.location_text,
      desired_salary = excluded.desired_salary,
      salary_currency = excluded.salary_currency,
      preferred_locations = excluded.preferred_locations,
      remote_preference = excluded.remote_preference,
      skills = excluded.skills,
      work_eligibility = excluded.work_eligibility,
      notice_period_days = excluded.notice_period_days,
      interview_availability = excluded.interview_availability,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      profile.fullName,
      profile.email || null,
      null,
      profile.linkedInUrl || null,
      profile.githubUrl || null,
      null,
      profile.targetRole || null,
      null,
      profile.preferredLocations.join(", "),
      profile.desiredSalary ?? null,
      profile.salaryCurrency,
      JSON.stringify(profile.preferredLocations),
      profile.remotePreference,
      JSON.stringify(profile.skills),
      profile.workEligibility,
      profile.noticePeriodDays ?? null,
      profile.interviewAvailability,
    ],
  );

  linkedProfileId = id;
  return id;
}

async function readSettingsRow(db: DatabaseDriver): Promise<AppSettings> {
  const rows = await db.select<SettingsRow>(
    `
    SELECT
      s.*,
      COALESCE(s.profile_id, p.id) AS profile_id,
      p.full_name AS profile_full_name,
      p.email AS profile_email,
      p.desired_salary AS profile_desired_salary,
      p.salary_currency AS profile_salary_currency,
      p.preferred_locations AS profile_preferred_locations,
      p.remote_preference AS profile_remote_preference,
      p.skills AS profile_skills,
      p.linkedin_url AS profile_linkedin_url,
      p.github_url AS profile_github_url,
      p.portfolio_url AS profile_portfolio_url,
      p.headline AS profile_headline,
      p.work_eligibility AS profile_work_eligibility,
      p.notice_period_days AS profile_notice_period_days,
      p.interview_availability AS profile_interview_availability,
      p.location_text AS profile_location_text
    FROM settings s
    LEFT JOIN profiles p ON p.id = COALESCE(
      s.profile_id,
      (
        SELECT id
        FROM profiles
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1
      )
    )
    WHERE s.id = $1
    LIMIT 1
    `,
    [STORE_KEY],
  );
  const row = rows[0];

  if (!row) {
    const defaults = cloneSettings(DEFAULT_SETTINGS);
    await upsertSettingsRow(db, defaults, null);
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

  let profileId = linkedProfileId;
  if (settings.userProfile) {
    const profileParse = UserProfileInputSchema.safeParse(settings.userProfile);
    if (!profileParse.success) {
      throw new Error(
        "UserProfile validation failed: " +
          JSON.stringify(profileParse.error.format()),
      );
    }
    profileId = await upsertProfileRow(db, profileParse.data, linkedProfileId);
  }

  await upsertSettingsRow(db, updated, profileId);
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

  let profileId = linkedProfileId;
  if (key === "userProfile") {
    const profileParse = UserProfileInputSchema.safeParse(value);
    if (!profileParse.success) {
      throw new Error(
        "UserProfile validation failed: " +
          JSON.stringify(profileParse.error.format()),
      );
    }
    profileId = await upsertProfileRow(db, profileParse.data, linkedProfileId);
  }

  await upsertSettingsRow(db, updated, profileId);
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
export async function getUserProfile(): Promise<UserProfile | null> {
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
  const db = getDatabase();
  await upsertSettingsRow(db, cloneSettings(DEFAULT_SETTINGS), linkedProfileId);
}

export { DEFAULT_SETTINGS };
