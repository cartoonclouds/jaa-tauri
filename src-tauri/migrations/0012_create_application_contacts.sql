CREATE TABLE IF NOT EXISTS application_contacts (
  application_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'owner',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (application_id, contact_id),

  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,
  FOREIGN KEY (contact_id)
    REFERENCES contacts(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_application_contacts_contact_id
ON application_contacts (contact_id);
