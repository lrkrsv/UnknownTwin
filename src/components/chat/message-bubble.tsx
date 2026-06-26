"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SourceChips } from "@/components/chat/source-chips";
import { MentorCta } from "@/components/chat/mentor-cta";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onEscalated?: () => void;
}

export function MessageBubble({ message, onEscalated }: MessageBubbleProps) {
  const isStudent = message.role === "student";
  const isMentor = message.role === "mentor";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isStudent ? "items-end" : "items-start"
      )}
    >
      {isMentor && (
        <Badge variant="secondary" className="text-[10px]">
          University mentor
        </Badge>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isStudent
            ? "bg-primary text-primary-foreground"
            : isMentor
              ? "border border-emerald-200 bg-emerald-50 text-foreground dark:border-emerald-900 dark:bg-emerald-950/40"
              : "border bg-card text-card-foreground"
        )}
      >
        {isStudent ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.streaming && !message.content ? (
          <span className="inline-flex gap-1 text-muted-foreground">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-100">●</span>
            <span className="animate-pulse delay-200">●</span>
          </span>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isStudent &&
        !message.streaming &&
        message.sources &&
        message.sources.length > 0 && <SourceChips sources={message.sources} />}

      {!isStudent &&
        !isMentor &&
        !message.streaming &&
        message.needsHuman && (
          <MentorCta
            messageId={message.id}
            escalationStatus={message.escalationStatus}
            onEscalated={onEscalated}
          />
        )}
    </div>
  );
}
