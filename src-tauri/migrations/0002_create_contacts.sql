CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('company', 'recruiter')),
  location_text TEXT,
  location_lat REAL,
  location_lng REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id
ON contacts (company_id);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at
ON contacts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_full_name
ON contacts (full_name);

CREATE INDEX IF NOT EXISTS idx_contacts_email
ON contacts (email);

CREATE INDEX IF NOT EXISTS idx_contacts_type
ON contacts (type);

CREATE INDEX IF NOT EXISTS idx_contacts_location_text
ON contacts (location_text);
