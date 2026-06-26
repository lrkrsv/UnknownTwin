import { requireUser } from "@/lib/auth/get-user";
import {
  conversationTitle,
  createConversation,
  getConversation,
  insertMessage,
  type ChatSource,
} from "@/lib/chat-db";
import { RAG_CONFIDENCE_THRESHOLD } from "@/lib/constants";
import { detectLanguage } from "@/lib/language";
import { generateStream } from "@/lib/llm";
import { buildProfessorPrompt, LOW_CONFIDENCE_MESSAGE } from "@/lib/prompts";
import { retrieve } from "@/lib/retrieve";
import { stripThinkingBlocks, createThinkingStripper } from "@/lib/stream-filter";
import { chatMessageSchema } from "@/lib/validations/chat";

function sseEncode(event: string, data: unknown): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function* streamTextAsTokens(text: string): AsyncGenerator<string> {
  const words = text.split(/(\s+)/);
  for (const part of words) {
    if (part) yield part;
  }
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { conversationId: existingId, message } = parsed.data;

  let conversationId = existingId;
  if (conversationId) {
    const existing = getConversation(conversationId, user.id);
    if (!existing) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    const created = createConversation(user.id, conversationTitle(message));
    conversationId = created.id;
  }

  insertMessage({
    conversationId,
    role: "student",
    content: message,
  });

  const hits = await retrieve(message, { k: 5 });
  const topScore = hits[0]?.score ?? 0;
  const needsHuman = topScore < RAG_CONFIDENCE_THRESHOLD;

  const sources: ChatSource[] = hits.map((h) => ({
    id: h.id,
    title: h.title,
    module: h.module,
    score: h.score,
    content: h.content,
  }));

  const stream = new ReadableStream({
    async start(controller) {
      let fullAnswer = "";

      try {
        controller.enqueue(
          sseEncode("meta", {
            conversationId,
            sources: sources.map(({ id, title, module, score, content }) => ({
              id,
              title,
              module,
              score,
              content,
            })),
            confidence: topScore,
            needsHuman,
          })
        );

        if (needsHuman) {
          for await (const delta of streamTextAsTokens(LOW_CONFIDENCE_MESSAGE)) {
            fullAnswer += delta;
            controller.enqueue(sseEncode("token", { delta }));
          }
        } else {
          const language = detectLanguage(message);
          const systemPrompt = buildProfessorPrompt({
            contextChunks: hits,
            language,
          });

          const llmMessages = [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: message },
          ];

          const stripper = createThinkingStripper();

          for await (const delta of generateStream(llmMessages)) {
            const cleaned = stripper(delta);
            if (cleaned) {
              fullAnswer += cleaned;
              controller.enqueue(sseEncode("token", { delta: cleaned }));
            }
          }

          fullAnswer = stripThinkingBlocks(fullAnswer);
        }

        const aiMessage = insertMessage({
          conversationId,
          role: "ai",
          content: fullAnswer.trim(),
          confidence: topScore,
          sources,
          needsHuman,
        });

        controller.enqueue(
          sseEncode("done", { messageId: aiMessage.id })
        );
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.enqueue(
          sseEncode("error", {
            message:
              error instanceof Error
                ? error.message
                : "Failed to generate response",
          })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
