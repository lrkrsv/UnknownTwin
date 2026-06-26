export const UNIVERSITY_NAME =
  process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Your University";

export const APP_NAME = "AI Campus";

export type UserRole = "student" | "mentor" | "admin";

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  student: ["/chat", "/dashboard", "/assignments"],
  mentor: ["/mentor", "/chat"],
  admin: ["/admin", "/mentor", "/chat", "/dashboard", "/assignments"],
};
