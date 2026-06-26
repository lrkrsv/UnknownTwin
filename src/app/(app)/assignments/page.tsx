import { getCurrentUser } from "@/lib/auth";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <PlaceholderPage
      name="Assignments"
      user={user}
      note="Assignment upload and AI feedback arrive in Milestone 5."
    />
  );
}
