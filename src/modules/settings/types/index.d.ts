import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { PersistedConstantSourceType } from "@shared/constants/persistedConstants";
import type { IPaginatedRepository, IRepository } from "@shared/types";

/**
 * Upsert payload for the application-wide settings record.
 */
export interface SettingUpsertPayload {
  id?: string;
  theme?: Setting["theme"];
  locale?: string;
  notificationsEnabled?: boolean;
  developerMode?: boolean;
}

/**
 * Constant row shape returned from persistence with UI-friendly visibility mapping.
 */
export interface ConstantEntryRow {
  type: string;
  value: string;
  label: string | null;
  isVisible: boolean;
}

/**
 * Payload used to insert or update a constant row.
 */
export interface ConstantEntryUpsertPayload {
  type: PersistedConstantSourceType;
  value: string;
  label: string | null;
  isVisible?: boolean;
  previousValue?: string;
}

/**
 * Query options for loading constant rows.
 */
export interface ListConstantRowsOptions {
  includeHidden?: boolean;
}

/**
 * Type alias for setting create payload.
 */
export type SettingCreatePayload = SettingUpsertPayload;

/**
 * Type alias for setting update payload.
 */
export type SettingUpdatePayload = SettingUpsertPayload & { id: string };

/**
 * Repository contract for persisted settings and editable constant rows.
 */
export interface ISettingRepository
  extends
    IRepository<Setting, SettingCreatePayload, SettingUpdatePayload>,
    IPaginatedRepository<Setting> {
  get(id?: string): Promise<Setting | null>;
  upsert(payload: SettingUpsertPayload): Promise<string>;
  getConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<ConstantEntryRow | null>;
  listConstantRows(
    type: PersistedConstantSourceType,
    options?: ListConstantRowsOptions,
  ): Promise<ConstantEntryRow[]>;
  upsertConstantRow(payload: ConstantEntryUpsertPayload): Promise<void>;
  deleteConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<void>;
}

/**
 * Per-stat persisted visibility metadata.
 */
export interface StatVisibilityState {
  /** Whether the stat card is currently visible. */
  visible: boolean;
  /** Optional ordering hint for cards in edit/add workflows. */
  sortOrder?: number | null;
}

/**
 * Visibility map keyed by statistic id.
 */
export type StatsVisibilityMap = Record<string, boolean | StatVisibilityState>;

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
  /** Whether the overview section is visible on the home page. */
  showOverview: boolean;
  /** Recently used search terms. */
  recentSearches: string[];
  /** Column visibility map keyed by table or datatable identifier. */
  tableColumnVisibility: Record<string, boolean>;
  /** Visibility map keyed by statistic id. */
  statsVisibility: StatsVisibilityMap;
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
  /** Visibility map keyed by statistic id. */
  statsVisibility: StatsVisibilityMap;
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
