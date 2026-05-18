CREATE TABLE IF NOT EXISTS application_events (
  id TEXT PRIMARY KEY NOT NULL,
  application_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_at TEXT NOT NULL,
  title TEXT,
  description TEXT,
  contact_id TEXT,
  attachment_path TEXT,
  reminder_at TEXT,
  outcome TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,

  FOREIGN KEY (contact_id)
    REFERENCES company_contacts(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_application_events_application_id
ON application_events (application_id);

CREATE INDEX IF NOT EXISTS idx_application_events_event_type
ON application_events (event_type);

CREATE INDEX IF NOT EXISTS idx_application_events_event_at
ON application_events (event_at);

CREATE INDEX IF NOT EXISTS idx_application_events_reminder_at
ON application_events (reminder_at);
