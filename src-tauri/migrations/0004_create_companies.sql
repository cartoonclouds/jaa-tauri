CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  website_url TEXT,
  linkedin_url TEXT,
  glassdoor_url TEXT,
  industry TEXT,
  size_range TEXT,
  location TEXT,
  notes TEXT,
  culture_notes TEXT,
  benefits TEXT,
  tech_stack TEXT,
  rating REAL,
  red_flags TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

CREATE INDEX IF NOT EXISTS idx_companies_name
ON companies (name);

CREATE INDEX IF NOT EXISTS idx_companies_industry
ON companies (industry);
