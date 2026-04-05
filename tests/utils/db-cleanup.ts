import { db } from '../../src/backend/db/index';
import { sessions, requests, modelTransitions, subagents } from '../../src/backend/db/schema';

/**
 * Cleans up all database tables for test isolation.
 * Call in beforeEach() to ensure tests start with clean state.
 *
 * Order matters due to foreign key constraints:
 * 1. modelTransitions (references sessions)
 * 2. subagents (references sessions)
 * 3. requests (references sessions)
 * 4. sessions (base table)
 */
export async function cleanupDatabase(): Promise<void> {
  await db.delete(modelTransitions);
  await db.delete(subagents);
  await db.delete(requests);
  await db.delete(sessions);
}
