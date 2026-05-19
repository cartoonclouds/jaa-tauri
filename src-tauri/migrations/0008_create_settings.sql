CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY NOT NULL,
  theme TEXT NOT NULL DEFAULT 'system',
  locale TEXT NOT NULL DEFAULT 'en-GB',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  developer_mode INTEGER NOT NULL DEFAULT 0,
  sidebar_collapsed INTEGER NOT NULL DEFAULT 0,
  recent_searches TEXT NOT NULL DEFAULT '[]',
  table_column_visibility TEXT NOT NULL DEFAULT '{}',
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
