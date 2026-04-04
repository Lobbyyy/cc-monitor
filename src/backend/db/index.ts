import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { expandPath } from '../utils/path';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!dbInstance) {
    const dbPath = expandPath(
      process.env.DATABASE_URL || '~/.claude-usage-monitor/database.db'
    );

    const sqlite = new Database(dbPath);
    dbInstance = drizzle(sqlite, { schema });
  }

  return dbInstance;
}

export const db = getDatabase();
