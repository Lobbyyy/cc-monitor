import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { expandPath } from '../utils/path';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export async function initDatabase() {
  const dbPath = expandPath(
    process.env.DATABASE_URL || '~/.claude-usage-monitor/database.db'
  );

  // Create directory if doesn't exist
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  // Run migrations
  migrate(db, { migrationsFolder: './migrations' });

  console.log('Database initialized at:', dbPath);
  return db;
}

// Run if called directly
if (import.meta.main) {
  await initDatabase();
}
