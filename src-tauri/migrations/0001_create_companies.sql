CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  website_url TEXT,
  linkedin_url TEXT,
  industry TEXT,
  size TEXT,
  location_text TEXT,
  location_lat REAL,
  location_lng REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_location_coords
ON companies (location_lat, location_lng);