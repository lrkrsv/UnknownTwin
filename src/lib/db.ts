/**
 * SQLite database singleton — see lib/db/connection.ts for implementation.
 * M1 spec entry point: `lib/db.ts`
 */
export {
  getDb,
  closeDb,
  ensureDataDirs,
  getDatabasePath,
} from "./db/index";
