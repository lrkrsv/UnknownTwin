import Link from "next/link";
import { BookOpen, Brain, MessageSquare, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";

const features = [
  {
    icon: MessageSquare,
    title: "AI Professor",
    description:
      "Ask anything about your modules. Answers are grounded in official course materials — never invented.",
  },
  {
    icon: Brain,
    title: "AI Coach",
    description:
      "Track your progress, spot weak areas, and get personalised revision suggestions.",
  },
  {
    icon: Users,
    title: "Human Mentors",
    description:
      "When the AI isn't confident, escalate to a real university mentor. Their answers make the system smarter.",
  },
  {
    icon: BookOpen,
    title: "Practice & Feedback",
    description:
      "Generate exercises from lessons and get rubric-based feedback before you submit.",
  },
  {
    icon: Shield,
    title: "Trusted Knowledge",
    description:
      "Every response cites official sources. Policies and grades always stay with your lecturers.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Digital twin of {UNIVERSITY_NAME}
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your personal AI campus, grounded in truth
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {APP_NAME} gives every student an AI Professor, AI Coach, and AI
              Mentor — all powered only by your university&apos;s official
              knowledge base.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
                Get started
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Built for how students actually learn
          </h2>
          <p className="mt-3 text-muted-foreground">
            Accurate, supportive, and always tied to official university content.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="font-heading text-lg">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-semibold">
            Ready to explore your AI campus?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create a free account with your university email.
          </p>
          <Button className="mt-6" nativeButton={false} render={<Link href="/signup" />}>
            Create account
          </Button>
        </div>
      </section>
    </>
  );
}
