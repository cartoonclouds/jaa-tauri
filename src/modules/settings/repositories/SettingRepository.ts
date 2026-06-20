import type {
  AppSettings,
  ConstantEntryRow,
  ConstantEntryUpsertPayload,
  DeveloperSettings,
  ISettingRepository,
  ListConstantRowsOptions,
  NotificationSettings,
  SettingCreatePayload,
  SettingUpdatePayload,
  SettingUpsertPayload,
  ThemeSettings,
  UiPreferences,
} from "../types";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { DatatablePageQuery, DatatablePageResult } from "@shared/types";

import { logError } from "@infra/logging/appLogger";
import { SETTING_SEARCH_FIELDS } from "@modules/settings/constants";
import { SettingRepositoryUpsertSchema } from "@modules/settings/domain/zod/settings.schema";
import { mapSettingRowToEntity } from "@modules/settings/repositories/mappers/mapSettingRow";
import {
  CONSTANT_MODULE_SOURCES,
  type PersistedConstantSourceType,
} from "@shared/constants/persistedConstants";
import { ValidationError } from "@shared/domain/errors";
import { normalizeConstantValue } from "@shared/utils/constantValue";
import { normalizeAliasedLiteralValue } from "@shared/utils/database-mapping/normalizationUtils";
import {
  fromDbBoolean,
  parseBooleanRecordValue,
  toDbBooleanInt,
} from "@shared/utils/database-mapping/persistenceValueUtils";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";
import { toErrorMessage } from "@shared/utils/error";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";
import { parseStringArray } from "@shared/utils/parse";
import { z } from "zod";

const SettingsInputSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  showOverview: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  insightsVisibility: z.record(
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
  showOverview: true,
  recentSearches: [],
  tableColumnVisibility: {},
  insightsVisibility: {},
  onboardingCompleted: false,
};

const THEME_VALUES = ["light", "dark", "auto"] as const;

type SettingsRow = Record<string, unknown>;

let database: DatabaseDriver | null = null;

function cloneSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    recentSearches: [...settings.recentSearches],
    tableColumnVisibility: { ...settings.tableColumnVisibility },
    insightsVisibility: { ...settings.insightsVisibility },
  };
}

function normalizeTheme(value: unknown): AppSettings["theme"] {
  return normalizeAliasedLiteralValue(
    value,
    THEME_VALUES,
    { system: "auto" },
    DEFAULT_SETTINGS.theme,
  );
}

function parseInsightsVisibilityValue(
  value: unknown,
): AppSettings["insightsVisibility"] {
  if (typeof value !== "string") {
    return { ...DEFAULT_SETTINGS.insightsVisibility };
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS.insightsVisibility };
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<
      AppSettings["insightsVisibility"]
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
    return { ...DEFAULT_SETTINGS.insightsVisibility };
  }
}

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
    showOverview: fromDbBoolean(
      row.show_overview,
      DEFAULT_SETTINGS.showOverview,
    ),
    recentSearches: parseStringArray(
      row.recent_searches,
      DEFAULT_SETTINGS.recentSearches,
    ),
    tableColumnVisibility: parseBooleanRecordValue(
      row.table_column_visibility,
      DEFAULT_SETTINGS.tableColumnVisibility,
    ),
    insightsVisibility: parseInsightsVisibilityValue(row.stats_visibility),
    onboardingCompleted: fromDbBoolean(
      row.onboarding_completed,
      DEFAULT_SETTINGS.onboardingCompleted,
    ),
  };
}

function getDatabase(): DatabaseDriver {
  if (database) {
    return database;
  }

  const db = getNuxtDatabase();
  database = db;

  return db;
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
      show_overview,
      recent_searches,
      table_column_visibility,
      stats_visibility,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      notifications_enabled = excluded.notifications_enabled,
      developer_mode = excluded.developer_mode,
      show_overview = excluded.show_overview,
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
      toDbBooleanInt(settings.showOverview),
      JSON.stringify(settings.recentSearches),
      JSON.stringify(settings.tableColumnVisibility),
      JSON.stringify(settings.insightsVisibility),
      toDbBooleanInt(settings.onboardingCompleted),
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
  if (rows.length === 0) {
    const defaults = cloneSettings(DEFAULT_SETTINGS);
    await upsertSettingsRow(db, defaults);
    return defaults;
  }

  const row = rows[0];

  return mapRowToSettings(row);
}

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

export async function getSettings(): Promise<AppSettings> {
  const db = getDatabase();
  return await readSettingsRow(db);
}

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

export async function getSetting<K extends keyof AppSettings>(
  key: K,
): Promise<AppSettings[K]> {
  const settings = await getSettings();
  return settings[key];
}

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

export async function getThemeSettings(): Promise<ThemeSettings> {
  const theme = await getSetting("theme");
  return { theme };
}

export async function setThemeSettings(settings: ThemeSettings): Promise<void> {
  await setSetting("theme", settings.theme);
}

export async function getUiPreferences(): Promise<UiPreferences> {
  const settings = await getSettings();
  return {
    tableColumnVisibility: settings.tableColumnVisibility,
    insightsVisibility: settings.insightsVisibility,
  };
}

export async function setUiPreferences(prefs: UiPreferences): Promise<void> {
  await setSettings(prefs);
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const notificationsEnabled = await getSetting("notificationsEnabled");
  return { notificationsEnabled };
}

export async function setNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  await setSetting("notificationsEnabled", settings.notificationsEnabled);
}

export async function getDeveloperSettings(): Promise<DeveloperSettings> {
  const developerMode = await getSetting("developerMode");
  return { developerMode };
}

export async function setDeveloperSettings(
  settings: DeveloperSettings,
): Promise<void> {
  await setSetting("developerMode", settings.developerMode);
}

export async function addRecentSearch(query: string): Promise<void> {
  const current = await getSetting("recentSearches");
  const updated = [
    query,
    ...current.filter((search) => search !== query),
  ].slice(0, 10);
  await setSetting("recentSearches", updated);
}

export async function clearRecentSearches(): Promise<void> {
  await setSetting("recentSearches", []);
}

export async function setTableColumnVisibility(
  visibility: Record<string, boolean>,
): Promise<void> {
  await setSetting("tableColumnVisibility", visibility);
}

export async function getTableColumnVisibility(): Promise<
  Record<string, boolean>
> {
  return await getSetting("tableColumnVisibility");
}

export async function getOnboardingCompleted(): Promise<boolean> {
  return await getSetting("onboardingCompleted");
}

export async function setOnboardingCompleted(value: boolean): Promise<void> {
  await setSetting("onboardingCompleted", value);
}

export async function resetSettings(): Promise<void> {
  const db = getDatabase();
  await upsertSettingsRow(db, cloneSettings(DEFAULT_SETTINGS));
}

export { DEFAULT_SETTINGS };

/**
 * Resolves settings label.
 */
function resolveSettingsLabel(type: PersistedConstantSourceType): string {
  const typeSegments = type.split(".");
  const fallbackKey =
    typeSegments.length > 0 ? typeSegments[typeSegments.length - 1] : type;

  let key: string = fallbackKey;

  for (const source of CONSTANT_MODULE_SOURCES) {
    for (const exportName of Object.keys(source.module)) {
      if (`${source.namespace}.${exportName}` === type) {
        key = exportName;
        break;
      }
    }
  }

  return key
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * SQLite-backed repository for settings and constant metadata management.
 */
export class SettingRepository implements ISettingRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private toConstantEntryRow(row: {
    type: string;
    value: string;
    label: string | null;
    is_visible: number | boolean;
  }): ConstantEntryRow {
    return {
      type: row.type,
      value: normalizeConstantValue(row.value),
      label: row.label,
      isVisible: fromDbBoolean(row.is_visible, false),
    };
  }

  async get(id = "app"): Promise<Setting | null> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM settings WHERE id = $1 LIMIT 1",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return mapSettingRowToEntity(row);
  }

  async list(): Promise<Setting[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "settings",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );
    return rows.map((row) => mapSettingRowToEntity(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Setting>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      SETTING_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM settings
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM settings",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM settings
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM settings
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapSettingRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async upsert(payload: SettingUpsertPayload): Promise<string> {
    const parseResult = SettingRepositoryUpsertSchema.safeParse(payload);
    if (!parseResult.success) {
      console.error("SettingRepository.upsert validation failed", {
        payload,
        error: parseResult.error,
      });
      throw new ValidationError(
        "Setting validation failed: " +
          JSON.stringify(parseResult.error.format()),
      );
    }

    const validated = parseResult.data;
    const id = validated.id ?? "app";

    await this.db.execute(
      `INSERT INTO settings (id, theme, locale, notifications_enabled, show_overview, developer_mode, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         theme = excluded.theme,
         locale = excluded.locale,
         notifications_enabled = excluded.notifications_enabled,
         show_overview = excluded.show_overview,
         developer_mode = excluded.developer_mode,
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        validated.theme ?? "system",
        validated.locale ?? "en-GB",
        validated.notificationsEnabled === false ? 0 : 1,
        validated.showOverview === false ? 0 : 1,
        validated.developerMode === true ? 1 : 0,
      ],
    );
    return id;
  }

  async getConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<ConstantEntryRow | null> {
    const normalizedLookupValue = normalizeConstantValue(value);
    const rows = await this.db.select<{
      type: string;
      value: string;
      label: string | null;
      is_visible: number | boolean;
    }>(
      `SELECT type, value, label, is_visible
       FROM constants
       WHERE type = $1 AND value = $2
       LIMIT 1`,
      [type, normalizedLookupValue],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return this.toConstantEntryRow(row);
  }

  async listConstantRows(
    type: PersistedConstantSourceType,
    options: ListConstantRowsOptions = {},
  ): Promise<ConstantEntryRow[]> {
    const rows = await this.db.select<{
      type: string;
      value: string;
      label: string | null;
      is_visible: number | boolean;
    }>(
      `SELECT type, value, label, is_visible
       FROM constants
       WHERE type = $1
         AND ($2 = 1 OR is_visible = 1)
       ORDER BY value ASC`,
      [type, options.includeHidden === true ? 1 : 0],
    );

    return rows.map((row) => this.toConstantEntryRow(row));
  }

  async upsertConstantRow(payload: ConstantEntryUpsertPayload): Promise<void> {
    const normalizedValue = normalizeConstantValue(payload.value);
    const normalizedLabel = payload.label?.trim() ? payload.label.trim() : null;
    const normalizedIsVisible = payload.isVisible !== false;
    const settingsLabel = resolveSettingsLabel(payload.type);

    if (normalizedValue.length === 0) {
      throw new ValidationError("Constant value cannot be empty");
    }

    const previousValue = payload.previousValue
      ? normalizeConstantValue(payload.previousValue)
      : undefined;

    if (previousValue && previousValue !== normalizedValue) {
      await this.db.transaction(async (tx) => {
        await tx.execute(
          `DELETE FROM constants
           WHERE type = $1 AND value = $2`,
          [payload.type, previousValue],
        );

        await tx.execute(
          `INSERT INTO constants (settings_label, type, value, label, is_visible)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT(type, value) DO UPDATE SET
             label = excluded.label,
             is_visible = excluded.is_visible`,
          [
            settingsLabel,
            payload.type,
            normalizedValue,
            normalizedLabel,
            normalizedIsVisible ? 1 : 0,
          ],
        );
      });

      return;
    }

    await this.db.execute(
      `INSERT INTO constants (settings_label, type, value, label, is_visible)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(type, value) DO UPDATE SET
         label = excluded.label,
         is_visible = excluded.is_visible`,
      [
        settingsLabel,
        payload.type,
        normalizedValue,
        normalizedLabel,
        normalizedIsVisible ? 1 : 0,
      ],
    );
  }

  async deleteConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<void> {
    const normalizedValue = normalizeConstantValue(value);
    await this.db.execute(
      `DELETE FROM constants
       WHERE type = $1 AND value = $2`,
      [type, normalizedValue],
    );
  }

  async create(payload: SettingCreatePayload): Promise<string> {
    return this.upsert(payload);
  }

  async update(payload: SettingUpdatePayload): Promise<void> {
    await this.upsert(payload);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM settings WHERE id = $1", [id]);
  }
}
