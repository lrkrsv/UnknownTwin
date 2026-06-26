import { getDb } from "@/lib/db";
import { embed } from "@/lib/embeddings";
import { bufferToEmbedding, dotProduct } from "@/lib/embedding-buffer";

export interface RetrieveOptions {
  k?: number;
  module?: string;
}

export interface RetrievedChunk {
  id: string;
  content: string;
  title: string;
  module: string | null;
  source_type: string;
  score: number;
}

export async function retrieve(
  query: string,
  opts?: RetrieveOptions
): Promise<RetrievedChunk[]> {
  const k = opts?.k ?? 5;
  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryVec = await embed(trimmed);
  const db = getDb();

  let sql = `
    SELECT
      c.id,
      c.content,
      c.embedding,
      d.title,
      d.module,
      d.source_type
    FROM chunks c
    INNER JOIN documents d ON d.id = c.document_id
    WHERE c.embedding IS NOT NULL
  `;
  const params: string[] = [];

  if (opts?.module) {
    sql += " AND d.module = ?";
    params.push(opts.module);
  }

  const rows = db.prepare(sql).all(...params) as Array<{
    id: string;
    content: string;
    embedding: Buffer;
    title: string;
    module: string | null;
    source_type: string;
  }>;

  const scored: RetrievedChunk[] = rows.map((row) => {
    const vec = bufferToEmbedding(row.embedding);
    return {
      id: row.id,
      content: row.content,
      title: row.title,
      module: row.module,
      source_type: row.source_type,
      score: dotProduct(queryVec, vec),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
