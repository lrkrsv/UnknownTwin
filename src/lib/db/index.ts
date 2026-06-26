import { closeDatabase, openDatabase } from "./connection";
import { runMigrations } from "./migrate";

let migrated = false;

export function getDb() {
  const database = openDatabase();
  if (!migrated) {
    runMigrations();
    migrated = true;
  }
  return database;
}

export function closeDb() {
  closeDatabase();
  migrated = false;
}

export { ensureDataDirs, getDatabasePath } from "./connection";
