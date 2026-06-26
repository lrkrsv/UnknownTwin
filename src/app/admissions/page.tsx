import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-heading text-lg font-semibold">
            {APP_NAME}
          </Link>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>
            Student login
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <CardHeader className="text-center">
            <Badge variant="secondary" className="mx-auto w-fit">
              Roadmap
            </Badge>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <CardTitle className="font-heading text-2xl">
              AI Admissions Assistant
            </CardTitle>
            <CardDescription>
              A public chat for prospective students at {UNIVERSITY_NAME} —
              programmes, scholarships, requirements, and career paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              This feature will be scaffolded in Milestone 7 with the same RAG
              pipeline, scoped to admissions content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
