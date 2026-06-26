export type UserRole = "student" | "mentor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface SessionPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
}
