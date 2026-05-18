CREATE TABLE IF NOT EXISTS application_tasks (
  id TEXT PRIMARY KEY NOT NULL,
  application_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TEXT,
  reminder_at TEXT,
  priority INTEGER NOT NULL DEFAULT 3,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,

  CHECK (priority >= 1 AND priority <= 5),
  CHECK (completed IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_application_tasks_application_id
ON application_tasks (application_id);

CREATE INDEX IF NOT EXISTS idx_application_tasks_due_at
ON application_tasks (due_at);

CREATE INDEX IF NOT EXISTS idx_application_tasks_completed
ON application_tasks (completed);

CREATE INDEX IF NOT EXISTS idx_application_tasks_reminder_at
ON application_tasks (reminder_at);
