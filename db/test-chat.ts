/**
 * CLI test for the chat pipeline (retrieve + local LLM, no HTTP).
 * Usage: tsx db/test-chat.ts "What is the Business Model Canvas?"
 */
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { closeDb, getDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import {
  conversationTitle,
  createConversation,
  insertMessage,
} from "@/lib/chat-db";
import { RAG_CONFIDENCE_THRESHOLD } from "@/lib/constants";
import { detectLanguage } from "@/lib/language";
import { generateStream } from "@/lib/llm";
import { buildProfessorPrompt, LOW_CONFIDENCE_MESSAGE } from "@/lib/prompts";
import { retrieve } from "@/lib/retrieve";

function ensureStudent(): string {
  const db = getDb();
  const email = "student@unknown-twin.local";
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email) as { id: string } | undefined;
  if (existing) return existing.id;

  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, 'student')`
  ).run(id, email, bcrypt.hashSync("student1234", 12), "Student User");
  return id;
}

async function main() {
  runMigrations();
  const query =
    process.argv[2] ?? "What is the Business Model Canvas?";
  const studentId = ensureStudent();

  console.log(`Query: "${query}"\n`);

  const hits = await retrieve(query, { k: 5 });
  const topScore = hits[0]?.score ?? 0;
  const needsHuman = topScore < RAG_CONFIDENCE_THRESHOLD;

  console.log(
    `Top score: ${topScore.toFixed(4)} (threshold: ${RAG_CONFIDENCE_THRESHOLD})`
  );
  console.log(`Needs human: ${needsHuman}`);
  console.log(`Sources: ${hits.map((h) => h.title).join(", ") || "(none)"}\n`);

  const conv = createConversation(studentId, conversationTitle(query));
  insertMessage({ conversationId: conv.id, role: "student", content: query });

  let answer = "";
  if (needsHuman) {
    answer = LOW_CONFIDENCE_MESSAGE;
    console.log("--- Short-circuit response ---\n");
    console.log(answer);
  } else {
    console.log("--- Streaming LLM response ---\n");
    const messages = [
      {
        role: "system" as const,
        content: buildProfessorPrompt({
          contextChunks: hits,
          language: detectLanguage(query),
        }),
      },
      { role: "user" as const, content: query },
    ];
    for await (const delta of generateStream(messages)) {
      process.stdout.write(delta);
      answer += delta;
    }
    console.log("\n");
  }

  insertMessage({
    conversationId: conv.id,
    role: "ai",
    content: answer.trim(),
    confidence: topScore,
    sources: hits.map((h) => ({
      id: h.id,
      title: h.title,
      module: h.module,
      score: h.score,
      content: h.content,
    })),
    needsHuman,
  });

  console.log(`\nConversation ${conv.id} saved.`);
  closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
