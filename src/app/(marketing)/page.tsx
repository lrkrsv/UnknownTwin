import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Brain, HardDrive, MessageSquare, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
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
  {
    icon: HardDrive,
    title: "Fully Local",
    description:
      "Runs entirely on your machine — SQLite database, local embeddings, and a local LLM. No cloud required.",
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
              {APP_NAME} gives every student at {UNIVERSITY_NAME} an AI Professor,
              AI Coach, and AI Mentor — powered only by official knowledge,
              running fully offline on your machine.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" nativeButton={false} render={<Link href="#sign-in" />}>
                Sign in
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="#sign-up" />}
              >
                Create account
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

      <section className="border-t bg-muted/30" id="sign-in">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-semibold">
              Sign in or create an account
            </h2>
            <p className="mt-2 text-muted-foreground">
              Local accounts only — no external services required.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Card id="sign-up">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Sign up</CardTitle>
                <CardDescription>New student account</CardDescription>
              </CardHeader>
              <CardContent>
                <SignupForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Sign in</CardTitle>
                <CardDescription>Welcome back</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  }
                >
                  <LoginForm />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
