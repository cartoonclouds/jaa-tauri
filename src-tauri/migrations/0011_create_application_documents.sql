CREATE TABLE IF NOT EXISTS application_documents (
  application_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'attachment',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (application_id, document_id),

  FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE,
  FOREIGN KEY (document_id)
    REFERENCES documents(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_application_documents_document_id
ON application_documents (document_id);
