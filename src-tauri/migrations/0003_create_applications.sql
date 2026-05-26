CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT,
  title TEXT NOT NULL,
  source_url TEXT,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  location_text TEXT,
  location_lat REAL,
  location_lng REAL,
  attendance_type TEXT CHECK (attendance_type IN ('remote', 'hybrid', 'on-site')),
  employment_type TEXT CHECK (employment_type IN ('part-time', 'contract', 'internship', 'full-time', 'volunteer')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT,
  description TEXT,
  interview_process TEXT,
  benefits TEXT,
  priority INTEGER NOT NULL DEFAULT 3,
  is_archived INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_company_id
ON applications (company_id);

CREATE INDEX IF NOT EXISTS idx_applications_location_coords
ON applications (location_lat, location_lng);

CREATE INDEX IF NOT EXISTS idx_applications_deleted_created_at
ON applications (deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_title
ON applications (title);

CREATE INDEX IF NOT EXISTS idx_applications_location_text
ON applications (location_text);