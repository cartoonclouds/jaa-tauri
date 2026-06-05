CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY NOT NULL,
  theme TEXT NOT NULL DEFAULT 'system',
  locale TEXT NOT NULL DEFAULT 'en-GB',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  developer_mode INTEGER NOT NULL DEFAULT 0,
  recent_searches TEXT NOT NULL DEFAULT '[]',
  table_column_visibility TEXT NOT NULL DEFAULT '{}',
  /**
    * Visibility settings for statistics, stored as a JSON object where keys are statistic IDs 
    * and values can be either a boolean indicating visibility or an object containing visibility 
    * and sort order information.
    */
  stats_visibility TEXT NOT NULL DEFAULT '{}',
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_created_at
ON settings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_settings_theme
ON settings (theme);

CREATE INDEX IF NOT EXISTS idx_settings_locale
ON settings (locale);
