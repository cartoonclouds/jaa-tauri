CREATE TABLE IF NOT EXISTS company_tags (
  company_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (company_id, tag_id),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_company_tags_tag_id
ON company_tags (tag_id);