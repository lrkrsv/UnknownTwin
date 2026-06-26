import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types/auth";

const PROTECTED_PREFIXES = [
  "/chat",
  "/dashboard",
  "/assignments",
  "/mentor",
  "/admin",
];

const ROLE_REQUIRED: Record<string, UserRole[]> = {
  "/mentor": ["mentor", "admin"],
  "/admin": ["admin"],
};

function routeRequiresAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_REQUIRED)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return roles;
    }
  }
  return null;
}

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (routeRequiresAuth(pathname) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = getDefaultRouteForRole(session.role);
    return NextResponse.redirect(url);
  }

  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && session && !requiredRoles.includes(session.role)) {
    const url = request.nextUrl.clone();
    url.pathname = getDefaultRouteForRole(session.role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
