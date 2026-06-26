import { getCurrentUser } from "@/lib/auth";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default async function MentorPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <PlaceholderPage
      name="Mentor Dashboard"
      user={user}
      note="Escalation queue and mentor replies arrive in Milestone 4."
    />
  );
}
