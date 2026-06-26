import path from "path";
import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { EMBEDDING_DIM } from "@/lib/constants";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

env.cacheDir = path.join(process.cwd(), "data", "model-cache");
env.allowLocalModels = true;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID);
  }
  return extractorPromise;
}

function outputToVectors(output: Awaited<ReturnType<FeatureExtractionPipeline>>): Float32Array[] {
  const dims = output.dims;

  if (dims.length === 1) {
    return [new Float32Array(output.data as Float32Array)];
  }

  if (dims.length === 2) {
    const [batchSize, dim] = dims;
    if (dim !== EMBEDDING_DIM) {
      throw new Error(`Unexpected embedding dim ${dim}, expected ${EMBEDDING_DIM}`);
    }
    const data = output.data as Float32Array;
    const vectors: Float32Array[] = [];
    for (let i = 0; i < batchSize; i++) {
      vectors.push(data.slice(i * dim, (i + 1) * dim));
    }
    return vectors;
  }

  throw new Error(`Unexpected tensor dims: ${dims.join("x")}`);
}

export async function embed(text: string): Promise<Float32Array> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Cannot embed empty text");
  }

  const extractor = await getExtractor();
  const output = await extractor(trimmed, { pooling: "mean", normalize: true });
  const [vector] = outputToVectors(output);
  return vector;
}

export async function embedBatch(texts: string[]): Promise<Float32Array[]> {
  const trimmed = texts.map((t) => t.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    return [];
  }

  const extractor = await getExtractor();
  const output = await extractor(trimmed, { pooling: "mean", normalize: true });
  return outputToVectors(output);
}
