CREATE TABLE IF NOT EXISTS semantic_documents (
  id TEXT PRIMARY KEY NOT NULL,
  module_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module_key, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_semantic_documents_module_type
  ON semantic_documents(module_key, entity_type);

CREATE INDEX IF NOT EXISTS idx_semantic_documents_entity
  ON semantic_documents(entity_id);

CREATE TABLE IF NOT EXISTS semantic_embeddings (
  document_id TEXT PRIMARY KEY NOT NULL,
  embedding_model TEXT NOT NULL,
  embedding_dimensions INTEGER NOT NULL,
  embedding_json TEXT NOT NULL,
  embedded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(document_id) REFERENCES semantic_documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_semantic_embeddings_model_dimensions
  ON semantic_embeddings(embedding_model, embedding_dimensions);