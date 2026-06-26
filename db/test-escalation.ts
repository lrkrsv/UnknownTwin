/**
 * CLI test for Milestone 4 escalation + self-learning loop (no browser/LLM).
 * Usage: npm run test:escalation
 */
import { randomUUID } from "crypto";
import { getDb } from "../src/lib/db";
import {
  answerEscalation,
  createEscalation,
  getEscalationById,
  listEscalations,
} from "../src/lib/escalations-db";
import { insertMessage, createConversation } from "../src/lib/chat-db";
import { retrieve } from "../src/lib/retrieve";
import { countUnreadNotifications } from "../src/lib/notifications-db";

async function main() {
  const db = getDb();
  const student = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get("student@demo.test") as { id: string };
  const mentor = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get("mentor@demo.test") as { id: string };

  if (!student || !mentor) {
    console.error("Run npm run seed first.");
    process.exit(1);
  }

  const question =
    "What is the parking permit refund policy at Unknown Twin?";
  const conv = createConversation(student.id, "Escalation test");
  insertMessage({ conversationId: conv.id, role: "student", content: question });
  const aiMsg = insertMessage({
    conversationId: conv.id,
    role: "ai",
    content: "I don't have enough information to answer confidently.",
    confidence: 0.12,
    needsHuman: true,
  });

  const escalation = createEscalation({
    messageId: aiMsg.id,
    conversationId: conv.id,
    studentId: student.id,
    question,
  });

  console.log("✓ Created escalation:", escalation.id, "status=", escalation.status);

  const open = listEscalations("open");
  if (!open.some((e) => e.id === escalation.id)) {
    throw new Error("Escalation not in open list");
  }
  console.log("✓ Visible in mentor open queue");

  const dup = createEscalation({
    messageId: aiMsg.id,
    conversationId: conv.id,
    studentId: student.id,
    question,
  });
  if (dup.id !== escalation.id) {
    throw new Error("Duplicate escalation created");
  }
  console.log("✓ Duplicate guard works");

  const answer =
    "Full refunds are available within 14 days of purchase if the permit is unused.";
  await answerEscalation({
    escalationId: escalation.id,
    mentorId: mentor.id,
    answer,
  });

  const answered = getEscalationById(escalation.id)!;
  if (answered.status !== "answered" || !answered.mentor_answer) {
    throw new Error("Escalation not answered");
  }
  console.log("✓ Escalation answered");

  const messages = db
    .prepare(`SELECT role, content FROM messages WHERE conversation_id = ?`)
    .all(conv.id) as Array<{ role: string; content: string }>;
  if (!messages.some((m) => m.role === "mentor" && m.content === answer)) {
    throw new Error("Mentor message not in conversation");
  }
  console.log("✓ Mentor message in student thread");

  const unread = countUnreadNotifications(student.id);
  if (unread < 1) {
    throw new Error("Student notification not created");
  }
  console.log("✓ Student notification created");

  const hits = await retrieve(question, { k: 3 });
  const mentorHit = hits.find((h) => h.source_type === "mentor_answer");
  if (!mentorHit || mentorHit.score < 0.35) {
    console.log("Retrieval hits:", hits.map((h) => ({ title: h.title, score: h.score, type: h.source_type })));
    throw new Error("Mentor answer not retrieved with high score");
  }
  console.log(
    `✓ Self-learning: mentor_answer chunk score=${mentorHit.score.toFixed(3)}`
  );

  console.log("\nAll Milestone 4 escalation tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
