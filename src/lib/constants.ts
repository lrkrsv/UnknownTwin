export const UNIVERSITY_NAME = "Unknown Twin";

export const APP_NAME = "AI Campus";

export type UserRole = "student" | "mentor" | "admin";

export const SESSION_COOKIE = "aicampus_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const CONFIDENCE_THRESHOLD = Number(
  process.env.CONFIDENCE_THRESHOLD ?? "0.55"
);

export const RAG_TOP_K = Number(process.env.RAG_TOP_K ?? "6");

export const EMBEDDING_DIM = 384;

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  student: ["/chat", "/dashboard", "/assignments"],
  mentor: ["/mentor", "/chat"],
  admin: ["/admin", "/mentor", "/chat", "/dashboard", "/assignments"],
};
