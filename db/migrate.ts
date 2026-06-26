import { closeDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";

const applied = runMigrations();
closeDb();

if (applied.length === 0) {
  console.log("No new migrations to apply.");
} else {
  console.log(`Applied migrations: ${applied.join(", ")}`);
}
