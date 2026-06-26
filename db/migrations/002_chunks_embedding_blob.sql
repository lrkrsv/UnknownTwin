-- Migrate chunks.embedding from TEXT to BLOB for Float32Array storage

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS chunks_v2 (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding BLOB,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO chunks_v2 (id, document_id, content, embedding, metadata, created_at)
SELECT id, document_id, content, NULL, metadata, created_at
FROM chunks;

DROP TABLE IF EXISTS chunks;

ALTER TABLE chunks_v2 RENAME TO chunks;

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_module ON documents(module);

PRAGMA foreign_keys = ON;
