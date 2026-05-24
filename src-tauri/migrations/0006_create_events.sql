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

CREATE TABLE IF NOT EXISTS application_events (
  application_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (application_id, event_id),
  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,
  FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_application_events_application_id
ON application_events (application_id);

CREATE INDEX IF NOT EXISTS idx_application_events_event_id
ON application_events (event_id);
