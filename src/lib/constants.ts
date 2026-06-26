export const UNIVERSITY_NAME = "Unknown Twin";

export const APP_NAME = "AI Campus";

export type UserRole = "student" | "mentor" | "admin";

export const SESSION_COOKIE = "aicampus_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Retrieval-based confidence cutoff (top cosine score). */
export const RAG_CONFIDENCE_THRESHOLD = Number(
  process.env.RAG_CONFIDENCE_THRESHOLD ?? "0.35"
);

/** Legacy alias kept for compatibility. */
export const CONFIDENCE_THRESHOLD = RAG_CONFIDENCE_THRESHOLD;

export const RAG_TOP_K = Number(process.env.RAG_TOP_K ?? "5");

export const EMBEDDING_DIM = 384;

export const LLM_ENGINE = (process.env.LLM_ENGINE ?? "transformers") as
  | "transformers"
  | "ollama";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";

export const TRANSFORMERS_LLM_MODEL =
  process.env.TRANSFORMERS_LLM_MODEL ?? "onnx-community/Qwen3-0.6B-ONNX";

export const TRANSFORMERS_LLM_DTYPE =
  process.env.TRANSFORMERS_LLM_DTYPE ?? "q4";

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  student: ["/chat", "/dashboard", "/assignments"],
  mentor: ["/mentor", "/chat"],
  admin: ["/admin", "/mentor", "/chat", "/dashboard", "/assignments"],
};
