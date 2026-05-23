CREATE TABLE IF NOT EXISTS constants (
  settings_label TEXT,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  PRIMARY KEY (type, value)
);

CREATE INDEX IF NOT EXISTS idx_constants_type ON constants(type);
