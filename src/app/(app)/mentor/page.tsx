import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MentorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <CardTitle className="font-heading text-2xl">Mentor Dashboard</CardTitle>
          <CardDescription>
            Review and answer escalated student questions. Coming in Milestone 4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Open escalations and reply workflow will appear here for mentors.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
