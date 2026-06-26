import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import type { User, UserRole } from "@/types/auth";

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    full_name: row.full_name as string,
    role: row.role as UserRole,
    created_at: row.created_at as string,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const db = getDb();
  const row = db
    .prepare(
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = ?"
    )
    .get(session.sub) as Record<string, unknown> | undefined;

  return row ? rowToUser(row) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export function findUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT id, email, full_name, role, created_at FROM users WHERE email = ?"
    )
    .get(email.toLowerCase()) as Record<string, unknown> | undefined;
  return row ? rowToUser(row) : null;
}

export function findUserWithPassword(
  email: string
): (User & { password_hash: string }) | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = ?"
    )
    .get(email.toLowerCase()) as Record<string, unknown> | undefined;
  if (!row) return null;
  return { ...rowToUser(row), password_hash: row.password_hash as string };
}
