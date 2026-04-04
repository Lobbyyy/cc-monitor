import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { expandPath } from '../utils/path';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!dbInstance) {
    const dbPath = expandPath(
      process.env.DATABASE_URL || '~/.claude-usage-monitor/database.db'
    );

    // Create directory if doesn't exist
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(dbPath);
    dbInstance = drizzle(sqlite, { schema });
  }

  return dbInstance;
}

export const db = getDatabase();
