CREATE TABLE IF NOT EXISTS application_events (
  application_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
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

CREATE INDEX IF NOT EXISTS idx_application_events_event_at
ON application_events (event_at);

CREATE INDEX IF NOT EXISTS idx_application_events_application_sort_order
ON application_events (application_id, sort_order);
