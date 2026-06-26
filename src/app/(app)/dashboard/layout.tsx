import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/lib/auth/roles";

export default async function StudentRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    redirect(getDefaultRouteForRole(user?.role ?? "student"));
  }
  return <>{children}</>;
}
