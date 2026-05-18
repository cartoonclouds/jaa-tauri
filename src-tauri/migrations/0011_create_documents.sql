CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY NOT NULL,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT,
  version_label TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CHECK (document_type IN (
    'cv',
    'cover_letter',
    'portfolio',
    'case_study',
    'technical_test',
    'job_description',
    'certificate',
    'reference',
    'other'
  ))
);

CREATE INDEX IF NOT EXISTS idx_documents_document_type
ON documents (document_type);

CREATE INDEX IF NOT EXISTS idx_documents_file_hash
ON documents (file_hash);
