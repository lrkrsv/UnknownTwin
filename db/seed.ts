import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { closeDb, getDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import { ingestDocument } from "@/lib/ingest";
import { SEED_USERS } from "@/lib/seed-users";

const SEED_KB = {
  title: "Business Model Canvas",
  source_type: "course_material",
  module: "Entrepreneurship Fundamentals",
  topic: "Business Model Canvas",
  content: `Learning objective: Students understand how organisations create, deliver, and capture value using the Business Model Canvas.

Summary: The Business Model Canvas is a strategic framework of nine building blocks: Customer Segments, Value Proposition, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partners, Cost Structure. It helps entrepreneurs quickly test and communicate business ideas.

FAQ:
"What is a Value Proposition?" → It explains why customers choose your solution over alternatives.
"What is a Customer Segment?" → The group of people or organisations your solution is designed for.

Assignment: Design a Business Model Canvas for an online university that provides affordable education to students worldwide.

Rubric: Innovation 30%, Feasibility 25%, Business understanding 25%, Presentation quality 20%.`,
};

export function seedUsers(): void {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const user of SEED_USERS) {
    const passwordHash = bcrypt.hashSync(user.password, 12);
    insert.run(randomUUID(), user.email, passwordHash, user.fullName, user.role);
  }
}

export async function seedKnowledgeBase(): Promise<number> {
  const db = getDb();
  const existing = db
    .prepare(
      "SELECT id FROM documents WHERE title = ? AND module = ? LIMIT 1"
    )
    .get(SEED_KB.title, SEED_KB.module) as { id: string } | undefined;

  if (existing) {
    const count = db
      .prepare("SELECT COUNT(*) as count FROM chunks WHERE document_id = ?")
      .get(existing.id) as { count: number };
    console.log(
      `Knowledge base already seeded (${count.count} chunks for "${SEED_KB.title}").`
    );
    return count.count;
  }

  const admin = db
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .get("admin@demo.test") as { id: string } | undefined;

  console.log("Embedding seed knowledge base (first run downloads the model)...");
  const result = await ingestDocument({
    ...SEED_KB,
    uploadedBy: admin?.id ?? null,
  });

  console.log(
    `Seeded "${SEED_KB.title}" with ${result.chunkCount} chunks (document ${result.documentId}).`
  );
  return result.chunkCount;
}

async function main() {
  runMigrations();
  seedUsers();
  const chunkCount = await seedKnowledgeBase();
  closeDb();

  console.log("\nSeeded demo users (Milestone 1):");
  for (const u of SEED_USERS) {
    console.log(`  ${u.role.padEnd(8)} ${u.email} / ${u.password}`);
  }
  console.log(`\nKnowledge base chunks: ${chunkCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
