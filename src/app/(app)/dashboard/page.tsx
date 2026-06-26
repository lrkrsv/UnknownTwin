import { getCurrentUser } from "@/lib/auth";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <PlaceholderPage
      name="AI Coach"
      user={user}
      note="Progress tracking and weak-area insights arrive in Milestone 6."
    />
  );
}
