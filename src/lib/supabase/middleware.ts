import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/database";

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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (routeRequiresAuth(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/chat";
    return NextResponse.redirect(url);
  }

  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as { role: UserRole } | null)?.role ?? "student";
    if (!requiredRoles.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : role === "mentor" ? "/mentor" : "/chat";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
