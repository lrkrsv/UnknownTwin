import { EMBEDDING_DIM } from "@/lib/constants";

export function embeddingToBuffer(vec: Float32Array): Buffer {
  if (vec.length !== EMBEDDING_DIM) {
    throw new Error(
      `Expected embedding dim ${EMBEDDING_DIM}, got ${vec.length}`
    );
  }
  return Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength);
}

export function bufferToEmbedding(buf: Buffer): Float32Array {
  if (buf.byteLength !== EMBEDDING_DIM * 4) {
    throw new Error(
      `Invalid embedding buffer size: ${buf.byteLength} bytes (expected ${EMBEDDING_DIM * 4})`
    );
  }
  const copy = Buffer.from(buf);
  return new Float32Array(
    copy.buffer,
    copy.byteOffset,
    copy.byteLength / Float32Array.BYTES_PER_ELEMENT
  );
}

/** Dot product for L2-normalized vectors equals cosine similarity. */
export function dotProduct(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i]! * b[i]!;
  }
  return sum;
}
