/**
 * Persisted application setting.
 */
export interface Setting {
  /** Unique setting identifier. */
  id: string;
  /** Theme preference. */
  theme: "system" | "light" | "dark";
  /** Locale identifier. */
  locale: string;
  /** Whether notifications are enabled. */
  notificationsEnabled: boolean;
  /** Whether developer mode is enabled. */
  developerMode: boolean;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create or update a setting record.
 */
export interface UpsertSettingInput {
  /** Optional setting identifier. */
  id?: string;
  /** Theme preference. */
  theme?: Setting["theme"];
  /** Locale identifier. */
  locale?: string;
  /** Whether notifications are enabled. */
  notificationsEnabled?: boolean;
  /** Whether developer mode is enabled. */
  developerMode?: boolean;
}



