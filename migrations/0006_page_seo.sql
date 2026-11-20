CREATE TABLE IF NOT EXISTS page_seo (
  page_key TEXT PRIMARY KEY CHECK (page_key IN ('home', 'about', 'education', 'projects', 'insights', 'cv', 'contact')),
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);