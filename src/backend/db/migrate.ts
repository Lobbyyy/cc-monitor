import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { expandPath } from '../utils/path';
import { ensureDirectoryExists } from '../utils/fs';
import { logger } from '../utils/logger';

/** Default database path */
const DEFAULT_DB_PATH = '~/.claude-usage-monitor/database.db';

/** Default migrations folder */
const DEFAULT_MIGRATIONS_FOLDER = './migrations';

/**
 * Migration error with context
 */
export class MigrationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'MigrationError';
  }
}

/**
 * Initializes the database and runs migrations
 * @param dbPath - Optional custom database path
 * @param migrationsFolder - Optional custom migrations folder
 * @returns The initialized Drizzle database instance
 * @throws MigrationError if initialization or migration fails
 */
export async function initDatabase(
  dbPath?: string,
  migrationsFolder: string = DEFAULT_MIGRATIONS_FOLDER
): Promise<ReturnType<typeof drizzle>> {
  const resolvedPath = expandPath(dbPath || process.env.DATABASE_URL || DEFAULT_DB_PATH);

  try {
    logger.info({ path: resolvedPath }, 'Initializing database...');

    ensureDirectoryExists(resolvedPath);

    const sqlite = new Database(resolvedPath);
    const db = drizzle(sqlite);

    logger.info({ folder: migrationsFolder }, 'Running migrations...');
    migrate(db, { migrationsFolder });

    logger.info({ path: resolvedPath }, 'Database initialized successfully');
    return db;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ err }, 'Database initialization failed');
    throw new MigrationError(`Failed to initialize database at ${resolvedPath}`, err);
  }
}

// Run if called directly
if (import.meta.main) {
  try {
    await initDatabase();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}
