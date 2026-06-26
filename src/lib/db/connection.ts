import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export function getDatabasePath(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "aicampus.db");
}

export function ensureDataDirs(): void {
  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), "data", "uploads"), { recursive: true });
}

let db: Database.Database | null = null;

export function openDatabase(): Database.Database {
  if (!db) {
    ensureDataDirs();
    db = new Database(getDatabasePath());
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
