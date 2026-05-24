-- Indexes for server-side datatable pagination/search queries.
-- These cover commonly filtered text columns and created_at ordering.

-- tags
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_color ON tags(color);

-- companies
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_location_text ON companies(location_text);

-- contacts
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_full_name ON contacts(full_name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_location_text ON contacts(location_text);

-- documents
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_documents_kind ON documents(kind);
CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_title ON notifications(title);
CREATE INDEX IF NOT EXISTS idx_notifications_body ON notifications(body);
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON notifications(severity);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_headline ON profiles(headline);

-- settings
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON settings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_theme ON settings(theme);
CREATE INDEX IF NOT EXISTS idx_settings_locale ON settings(locale);

-- applications
CREATE INDEX IF NOT EXISTS idx_applications_deleted_created_at ON applications(deleted_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_title ON applications(title);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_location_text ON applications(location_text);
