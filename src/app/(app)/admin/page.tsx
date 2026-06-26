import { getCurrentUser } from "@/lib/auth";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <PlaceholderPage
      name="Admin / Knowledge Base"
      user={user}
      note="Document management UI arrives in Milestone 7."
    />
  );
}
