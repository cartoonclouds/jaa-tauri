CREATE TABLE IF NOT EXISTS application_tags (
  application_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (application_id, tag_id),

  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_application_tags_tag_id
ON application_tags (tag_id);
