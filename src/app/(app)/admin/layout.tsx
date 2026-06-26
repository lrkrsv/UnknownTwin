import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect(getDefaultRouteForRole(user?.role ?? "student"));
  }
  return <>{children}</>;
}
