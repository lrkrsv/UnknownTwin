import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getProfile } from "@/lib/auth/get-profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
