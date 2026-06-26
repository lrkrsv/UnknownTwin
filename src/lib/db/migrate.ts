import fs from "fs";
import path from "path";
import { ensureDataDirs, openDatabase } from "./connection";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

export function runMigrations(): string[] {
  ensureDataDirs();
  const database = openDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Backward compat: copy from legacy schema_migrations table if present
  const legacy = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
    )
    .get() as { name: string } | undefined;
  if (legacy) {
    database.exec(`
      INSERT OR IGNORE INTO _migrations (version, applied_at)
      SELECT version, applied_at FROM schema_migrations;
    `);
  }

  const applied = new Set(
    database
      .prepare("SELECT version FROM _migrations ORDER BY version")
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
        .prepare("INSERT INTO _migrations (version) VALUES (?)")
        .run(file);
    });
    run();
    newlyApplied.push(file);
  }

  return newlyApplied;
}
