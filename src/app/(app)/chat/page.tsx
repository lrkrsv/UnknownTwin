import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="size-5" />
          </div>
          <CardTitle className="font-heading text-2xl">AI Professor</CardTitle>
          <CardDescription>
            Your grounded academic assistant. Coming in Milestone 3 with streaming
            RAG answers and source citations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Chat interface will appear here once the knowledge base and RAG
              pipeline are connected.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
