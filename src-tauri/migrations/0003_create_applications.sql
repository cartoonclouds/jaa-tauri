CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  event_flow_status TEXT NOT NULL DEFAULT 'saved' CHECK (event_flow_status IN ('saved', 'applied', 'interview', 'offer', 'rejected')),
  source_url TEXT,
  applied_at TEXT,
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
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_company_id
ON applications (company_id);

CREATE INDEX IF NOT EXISTS idx_applications_event_flow_status
ON applications (event_flow_status);

CREATE INDEX IF NOT EXISTS idx_applications_location_coords
ON applications (location_lat, location_lng);