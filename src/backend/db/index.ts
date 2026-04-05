import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { expandPath } from '../utils/path';
import { ensureDirectoryExists } from '../utils/fs';
import { logger } from '../utils/logger';
import * as schema from './schema';

/** Database instance singleton */
let dbInstance: ReturnType<typeof drizzle> | null = null;

/** Default database path */
const DEFAULT_DB_PATH = '~/.claude-usage-monitor/database.db';

/**
 * Database initialization error
 */
export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Gets or creates the database instance (singleton)
 * @returns The Drizzle database instance
 * @throws DatabaseError if database cannot be initialized
 */
export function getDatabase(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    try {
      const dbPath = expandPath(process.env.DATABASE_URL || DEFAULT_DB_PATH);

      ensureDirectoryExists(dbPath);

      const sqlite = new Database(dbPath);
      dbInstance = drizzle(sqlite, { schema });

      logger.debug({ path: dbPath }, 'Database connection established');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error({ err }, 'Failed to initialize database');
      throw new DatabaseError('Failed to initialize database', err);
    }
  }

  return dbInstance;
}

/** Pre-initialized database instance */
export const db = getDatabase();
