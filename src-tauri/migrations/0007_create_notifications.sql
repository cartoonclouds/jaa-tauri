CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY NOT NULL,
  application_id TEXT,
  event_id TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  scheduled_for TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,
  FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_application_id
ON notifications (application_id);

CREATE INDEX IF NOT EXISTS idx_notifications_event_id
ON notifications (event_id);
