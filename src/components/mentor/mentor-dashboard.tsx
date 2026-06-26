"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Escalation {
  id: string;
  message_id: string | null;
  conversation_id: string | null;
  student_id: string;
  question: string;
  status: "open" | "answered" | "closed";
  mentor_id: string | null;
  mentor_answer: string | null;
  created_at: string;
  answered_at: string | null;
  student_name: string;
  student_email: string;
  ai_answer: string | null;
  conversation_title: string | null;
}

function EscalationCard({
  escalation,
  readOnly,
  onAnswered,
}: {
  escalation: Escalation;
  readOnly?: boolean;
  onAnswered?: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/escalations/${escalation.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Failed to submit answer");
      return json;
    },
    onSuccess: () => {
      setAnswer("");
      queryClient.invalidateQueries({ queryKey: ["escalations"] });
      onAnswered?.();
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              {escalation.student_name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {escalation.student_email}
            </p>
          </div>
          <Badge
            variant={escalation.status === "open" ? "secondary" : "outline"}
          >
            {escalation.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(escalation.created_at).toLocaleString()}
          {escalation.conversation_title && (
            <> · {escalation.conversation_title}</>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Student question
          </p>
          <p className="text-sm">{escalation.question}</p>
        </div>

        {escalation.ai_answer && (
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              AI attempted answer
            </p>
            <p className="text-sm text-muted-foreground">
              {escalation.ai_answer}
            </p>
          </div>
        )}

        {readOnly && escalation.mentor_answer && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              Your answer
            </p>
            <p className="text-sm">{escalation.mentor_answer}</p>
          </div>
        )}

        {!readOnly && (
          <div className="space-y-2">
            <label
              htmlFor={`answer-${escalation.id}`}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Your answer
            </label>
            <textarea
              id={`answer-${escalation.id}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              placeholder="Write a clear answer the student can rely on…"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            {mutation.isError && (
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to submit"}
              </p>
            )}
            <Button
              onClick={() => mutation.mutate()}
              disabled={!answer.trim() || mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Submit answer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MentorDashboard() {
  const [tab, setTab] = useState<"open" | "answered">("open");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["escalations", tab],
    queryFn: async () => {
      const res = await fetch(`/api/escalations?status=${tab}`);
      if (!res.ok) throw new Error("Failed to load escalations");
      const json = await res.json();
      return json.escalations as Escalation[];
    },
    refetchInterval: tab === "open" ? 15000 : false,
  });

  const escalations = data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <h1 className="font-heading text-2xl font-semibold">
              Mentor Dashboard
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Review student escalations and publish answers back into the
            knowledge base.
          </p>
        </div>
        <div className="flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setTab("open")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "open"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="size-3.5" />
            Open
          </button>
          <button
            type="button"
            onClick={() => setTab("answered")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "answered"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckCircle2 className="size-3.5" />
            Answered
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" />
          Loading escalations…
        </div>
      )}

      {!isLoading && escalations.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {tab === "open"
            ? "No open escalations — students will appear here when they ask for a mentor."
            : "No answered escalations yet."}
        </div>
      )}

      <div className="space-y-4">
        {escalations.map((escalation) => (
          <EscalationCard
            key={escalation.id}
            escalation={escalation}
            readOnly={tab === "answered"}
            onAnswered={() => refetch()}
          />
        ))}
      </div>
    </div>
  );
}
