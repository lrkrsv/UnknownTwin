import type { UserRole } from "@/types/auth";

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "mentor":
      return "/mentor";
    default:
      return "/chat";
  }
}
