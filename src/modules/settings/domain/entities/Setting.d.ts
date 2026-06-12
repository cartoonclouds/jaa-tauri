import type { TemporalDateTime } from "@shared/utils/temporal";

/**
/** Theme preference values for the application UI. */
export type SettingTheme = "system" | "light" | "dark";

/**
 * All mutable data fields shared across setting read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface SettingBase {
  /** Theme preference. */
  theme: SettingTheme;
  /** Locale identifier. */
  locale: string;
  /** Whether notifications are enabled. */
  notificationsEnabled: boolean;
  /** Whether the overview section is shown on the home page. */
  showOverview: boolean;
  /** Whether developer mode is enabled. */
  developerMode: boolean;
}

/**
 * Persisted application setting.
 * Extends {@link SettingBase} with system-managed fields.
 */
export interface Setting extends SettingBase {
  /** Unique setting identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: TemporalDateTime;
  /** Last update timestamp. */
  updatedAt: TemporalDateTime;
}

/**
 * Input required to create or update a setting record.
 * Derived from {@link SettingBase}: all fields are optional plus an optional
 * identifier for targeting an existing row.
 */
export type UpsertSettingInput = Partial<SettingBase> & {
  /** Optional setting identifier. */
  id?: string;
};
