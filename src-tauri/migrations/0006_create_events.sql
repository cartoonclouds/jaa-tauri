CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY NOT NULL,
  contact_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (contact_id)
    REFERENCES contacts(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_contact_id
ON events (contact_id);
