CREATE TABLE IF NOT EXISTS company_contacts (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'other',
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  agency_name TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  CHECK (role IN ('recruiter', 'hiring_manager', 'interviewer', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id
ON company_contacts (company_id);

CREATE INDEX IF NOT EXISTS idx_company_contacts_email
ON company_contacts (email);
