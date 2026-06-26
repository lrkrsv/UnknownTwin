/**
 * Local auth helpers — M1 spec entry point: `lib/auth.ts`
 */
export {
  getCurrentUser,
  requireUser,
  requireRole,
  findUserByEmail,
  findUserWithPassword,
} from "./auth/get-user";

export { getDefaultRouteForRole } from "./auth/roles";

export {
  getSession,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "./auth/session";

export { hashPassword, verifyPassword } from "./auth/password";
