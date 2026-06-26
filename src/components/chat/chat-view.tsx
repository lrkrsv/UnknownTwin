"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import type { ChatMessage, ChatMetaEvent, Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";

function parseSseBlock(block: string): { event: string; data: string } | null {
  if (!block.trim()) return null;
  let event = "message";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7).trim();
    if (line.startsWith("data: ")) data = line.slice(6);
  }
  if (!data) return null;
  return { event, data };
}

async function consumeChatStream(
  response: Response,
  onMeta: (meta: ChatMetaEvent) => void,
  onToken: (delta: string) => void,
  onDone: () => void,
  onError: (message: string) => void
) {
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (!parsed) continue;

      const payload = JSON.parse(parsed.data) as Record<string, unknown>;

      if (parsed.event === "meta") {
        onMeta(payload as unknown as ChatMetaEvent);
      } else if (parsed.event === "token") {
        onToken((payload.delta as string) ?? "");
      } else if (parsed.event === "done") {
        onDone();
      } else if (parsed.event === "error") {
        onError((payload.message as string) ?? "Stream error");
      }
    }
  }
}

export function ChatView() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const streamingIdRef = useRef<string | null>(null);
  const streamConversationIdRef = useRef<string | null>(null);

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/chat/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const json = await res.json();
      return json.conversations as Conversation[];
    },
  });

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/chat/conversations/${id}`);
    if (!res.ok) throw new Error("Failed to load conversation");
    const json = await res.json();
    setMessages(
      (json.messages as ChatMessage[]).map((m) => ({
        ...m,
        streaming: false,
      }))
    );
  }, []);

  useEffect(() => {
    if (activeId) {
      loadConversation(activeId).catch(console.error);
    } else {
      setMessages([]);
    }
  }, [activeId, loadConversation]);

  async function handleSend(text: string) {
    if (!text.trim() || isStreaming) return;

    const studentMsg: ChatMessage = {
      id: `temp-student-${Date.now()}`,
      role: "student",
      content: text.trim(),
    };

    const aiPlaceholder: ChatMessage = {
      id: `temp-ai-${Date.now()}`,
      role: "ai",
      content: "",
      streaming: true,
      sources: [],
    };

    streamingIdRef.current = aiPlaceholder.id;
    setMessages((prev) => [...prev, studentMsg, aiPlaceholder]);
    setIsStreaming(true);
    setIsWarmingUp(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId ?? undefined,
          message: text.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Chat request failed");
      }

      await consumeChatStream(
        res,
        (meta) => {
          setIsWarmingUp(false);
          streamConversationIdRef.current = meta.conversationId;
          if (!activeId) setActiveId(meta.conversationId);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingIdRef.current
                ? {
                    ...m,
                    sources: meta.sources,
                    confidence: meta.confidence,
                    needsHuman: meta.needsHuman,
                  }
                : m
            )
          );
        },
        (delta) => {
          setIsWarmingUp(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingIdRef.current
                ? { ...m, content: m.content + delta }
                : m
            )
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingIdRef.current
                ? { ...m, streaming: false }
                : m
            )
          );
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          const reloadId = streamConversationIdRef.current ?? activeId;
          if (reloadId) {
            loadConversation(reloadId).catch(console.error);
          }
        },
        (message) => {
          throw new Error(message);
        }
      );
    } catch (error) {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== streamingIdRef.current)
          .concat({
            id: `error-${Date.now()}`,
            role: "ai",
            content:
              error instanceof Error
                ? `Sorry, something went wrong: ${error.message}`
                : "Sorry, something went wrong.",
          })
      );
    } finally {
      setIsStreaming(false);
      setIsWarmingUp(false);
      streamingIdRef.current = null;
    }
  }

  function handleNewChat() {
    setActiveId(null);
    setMessages([]);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <aside className="flex w-full max-w-[280px] shrink-0 flex-col border-r bg-muted/20 md:w-72">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-heading text-sm font-semibold">Conversations</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            disabled={isStreaming}
          >
            <Plus className="size-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">New chat</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {loadingConversations &&
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            {!loadingConversations && conversations?.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                No conversations yet. Ask your AI Professor a question to get
                started.
              </p>
            )}
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span className="line-clamp-2">{conv.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <h1 className="font-heading text-lg font-semibold">AI Professor</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Grounded answers from official Unknown Twin materials only.
          </p>
        </div>

        <MessageList
          messages={messages}
          isWarmingUp={isWarmingUp}
          isEmpty={!activeId && messages.length === 0}
        />

        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
