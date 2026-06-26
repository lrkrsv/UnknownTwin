import fs from "fs";
import path from "path";
import { ensureDataDirs, openDatabase } from "./connection";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

export function runMigrations(): string[] {
  ensureDataDirs();
  const database = openDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    database
      .prepare("SELECT version FROM schema_migrations ORDER BY version")
      .all()
      .map((row) => (row as { version: string }).version)
  );

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const newlyApplied: string[] = [];

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    const run = database.transaction(() => {
      database.exec(sql);
      database
        .prepare("INSERT INTO schema_migrations (version) VALUES (?)")
        .run(file);
    });
    run();
    newlyApplied.push(file);
  }

  return newlyApplied;
}
