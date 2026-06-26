import type { RetrievedChunk } from "@/lib/retrieve";
import { UNIVERSITY_NAME } from "@/lib/constants";

export interface ProfessorPromptInput {
  contextChunks: RetrievedChunk[];
  language: string;
}

export function buildProfessorPrompt({
  contextChunks,
  language,
}: ProfessorPromptInput): string {
  const contextBlock =
    contextChunks.length === 0
      ? "(No official materials were retrieved for this question.)"
      : contextChunks
          .map(
            (chunk, i) =>
              `--- Chunk ${i + 1} ---
Title: ${chunk.title}
Module: ${chunk.module ?? "General"}
Content:
${chunk.content}
---`
          )
          .join("\n\n");

  return `You are the AI Digital Twin of ${UNIVERSITY_NAME}.
Your role is to support students using ONLY the official university knowledge base provided below as context.

You should:
- Explain concepts clearly and adapt explanations to the student's level.
- Give a simple explanation, then a concrete real-world example when helpful.
- Answer in ${language} (the same language the student used).

You must NOT:
- Invent university policies, academic content, deadlines, grades, or facts not present in the provided context.

If the answer is not contained in the provided context, say plainly that you cannot confirm it from the official materials and recommend the student ask a university mentor. Do not guess.

Always be supportive, accurate, and encouraging.

Output plain markdown only. Do not wrap your answer in JSON or code fences.

OFFICIAL KNOWLEDGE BASE CONTEXT:
${contextBlock}`;
}

export const LOW_CONFIDENCE_MESSAGE = `I can't confirm this from the official university materials available to me.

The retrieved sources don't seem to cover your question well enough for a reliable answer. Please use **Ask a university mentor** to get help from a human expert at ${UNIVERSITY_NAME}.`;
