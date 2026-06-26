import type { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PlaceholderPageProps {
  name: string;
  user: User;
  note?: string;
}

export function PlaceholderPage({ name, user, note }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Coming soon — {name}
          </CardTitle>
          <CardDescription>
            {note ?? "This feature will be built in a later milestone."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <p className="text-muted-foreground">Signed in as</p>
            <p className="font-medium">{user.email}</p>
            <Badge variant="secondary" className="mt-2 capitalize">
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
