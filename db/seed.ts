import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { closeDb, getDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";

const DEFAULT_USERS = [
  {
    email: "admin@unknown-twin.local",
    password: "admin1234",
    fullName: "Admin User",
    role: "admin" as const,
  },
  {
    email: "mentor@unknown-twin.local",
    password: "mentor1234",
    fullName: "Mentor User",
    role: "mentor" as const,
  },
  {
    email: "student@unknown-twin.local",
    password: "student1234",
    fullName: "Student User",
    role: "student" as const,
  },
];

export function seedUsers(): void {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const user of DEFAULT_USERS) {
    const passwordHash = bcrypt.hashSync(user.password, 12);
    insert.run(randomUUID(), user.email, passwordHash, user.fullName, user.role);
  }
}

runMigrations();
seedUsers();
closeDb();

console.log("Database migrated and seeded with default users:");
for (const u of DEFAULT_USERS) {
  console.log(`  ${u.role.padEnd(8)} ${u.email} / ${u.password}`);
}
console.log("\nKnowledge base seeding arrives in Milestone 2.");
