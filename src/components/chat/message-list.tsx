"use client";

import { useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  isWarmingUp: boolean;
  isEmpty: boolean;
  onEscalated?: () => void;
}

export function MessageList({
  messages,
  isWarmingUp,
  isEmpty,
  onEscalated,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWarmingUp]);

  if (isEmpty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <h2 className="font-heading text-lg font-medium">
          Ask your AI Professor
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Try &ldquo;What is the Business Model Canvas?&rdquo; — answers are
          grounded in official course materials with source citations.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onEscalated={onEscalated}
          />
        ))}
        {isWarmingUp && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading local model (first request may take a moment)…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
