CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT,
  company_name_snapshot TEXT NOT NULL,
  job_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  applied_at TEXT,
  source_id TEXT,
  source_platform TEXT,
  job_advert_url TEXT,
  advert_snapshot_path TEXT,
  salary_min REAL,
  salary_max REAL,
  salary_currency TEXT,
  contract_type TEXT,
  location_text TEXT,
  work_mode TEXT NOT NULL DEFAULT 'unknown',
  priority INTEGER NOT NULL DEFAULT 3,
  notes TEXT,
  duplicate_key TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE SET NULL,

  FOREIGN KEY (source_id)
    REFERENCES job_sources(id)
    ON DELETE SET NULL,

  CHECK (status IN (
    'saved',
    'applied',
    'recruiter_contacted',
    'screening',
    'technical_test',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn',
    'accepted',
    'ghosted'
  )),
  CHECK (work_mode IN ('remote', 'hybrid', 'onsite', 'unknown')),
  CHECK (priority >= 1 AND priority <= 5),
  CHECK (is_archived IN (0, 1)),
  CHECK (is_deleted IN (0, 1)),
  CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_duplicate_key_unique
ON applications (duplicate_key)
WHERE duplicate_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_company_id
ON applications (company_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
ON applications (status);

CREATE INDEX IF NOT EXISTS idx_applications_applied_at
ON applications (applied_at);

CREATE INDEX IF NOT EXISTS idx_applications_source_id
ON applications (source_id);

CREATE INDEX IF NOT EXISTS idx_applications_priority
ON applications (priority);

CREATE INDEX IF NOT EXISTS idx_applications_work_mode
ON applications (work_mode);

CREATE INDEX IF NOT EXISTS idx_applications_contract_type
ON applications (contract_type);

CREATE INDEX IF NOT EXISTS idx_applications_archived_deleted
ON applications (is_archived, is_deleted);

CREATE INDEX IF NOT EXISTS idx_applications_updated_at
ON applications (updated_at);
