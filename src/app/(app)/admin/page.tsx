import { Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="size-5" />
          </div>
          <CardTitle className="font-heading text-2xl">Knowledge Base</CardTitle>
          <CardDescription>
            Upload documents, manage chunks, and review mentor answers. Coming in
            Milestone 7.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Admin tools for ingestion and knowledge base management will appear
              here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
