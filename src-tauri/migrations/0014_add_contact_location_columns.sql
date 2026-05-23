ALTER TABLE contacts
ADD COLUMN location_text TEXT;

ALTER TABLE contacts
ADD COLUMN location_lat REAL;

ALTER TABLE contacts
ADD COLUMN location_lng REAL;

CREATE INDEX IF NOT EXISTS idx_contacts_location_text
ON contacts (location_text);