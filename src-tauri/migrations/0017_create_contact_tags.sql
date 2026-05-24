CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (contact_id, tag_id),

  FOREIGN KEY (contact_id)
    REFERENCES contacts(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id
ON contact_tags (tag_id);