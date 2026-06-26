import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { chunkText } from "@/lib/chunk";
import { embedBatch } from "@/lib/embeddings";
import { embeddingToBuffer } from "@/lib/embedding-buffer";

export interface IngestDocumentInput {
  title: string;
  source_type: string;
  module?: string | null;
  topic?: string | null;
  content: string;
  uploadedBy?: string | null;
}

export interface IngestDocumentResult {
  documentId: string;
  chunkCount: number;
}

export async function ingestDocument(
  input: IngestDocumentInput
): Promise<IngestDocumentResult> {
  const trimmed = input.content.trim();
  if (!trimmed) {
    throw new Error("Document content cannot be empty");
  }

  const chunks = chunkText(trimmed);
  if (chunks.length === 0) {
    throw new Error("No chunks produced from document content");
  }

  const embeddings = await embedBatch(chunks.map((c) => c.content));
  if (embeddings.length !== chunks.length) {
    throw new Error("Embedding count mismatch with chunk count");
  }

  const documentId = randomUUID();
  const db = getDb();

  const insertDocument = db.prepare(`
    INSERT INTO documents (id, title, source_type, module, topic, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertChunk = db.prepare(`
    INSERT INTO chunks (id, document_id, content, embedding, metadata)
    VALUES (?, ?, ?, ?, ?)
  `);

  const run = db.transaction(() => {
    insertDocument.run(
      documentId,
      input.title,
      input.source_type,
      input.module ?? null,
      input.topic ?? null,
      input.uploadedBy ?? null
    );

    chunks.forEach((chunk, index) => {
      insertChunk.run(
        randomUUID(),
        documentId,
        chunk.content,
        embeddingToBuffer(embeddings[index]!),
        JSON.stringify({
          source_type: input.source_type,
          module: input.module ?? null,
          topic: input.topic ?? null,
          title: input.title,
          chunk_index: index,
        })
      );
    });
  });

  run();

  return { documentId, chunkCount: chunks.length };
}
