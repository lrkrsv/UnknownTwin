"use client";

import { useState } from "react";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MentorCtaProps {
  messageId: string;
  escalationStatus?: "open" | "answered" | "closed" | null;
  onEscalated?: () => void;
}

export function MentorCta({
  messageId,
  escalationStatus,
  onEscalated,
}: MentorCtaProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(escalationStatus ?? null);

  async function handleEscalate() {
    if (status || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to escalate");
      }
      setStatus("open");
      onEscalated?.();
      toast.success("Your question has been sent to a university mentor.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to escalate"
      );
    } finally {
      setLoading(false);
    }
  }

  if (status === "open") {
    return (
      <p className="text-xs text-amber-700 dark:text-amber-400">
        Escalated — waiting for a mentor.
      </p>
    );
  }

  if (status === "answered") {
    return (
      <p className="text-xs text-emerald-700 dark:text-emerald-400">
        Answered by mentor.
      </p>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleEscalate}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Users className="size-4" />
      )}
      Ask a university mentor
    </Button>
  );
}
