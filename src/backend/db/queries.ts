import { eq, sum, count } from 'drizzle-orm';
import { db } from './index';
import { sessions, requests } from './schema';
import type { ParsedSession, ParsedRequest } from '../types';
import { validateSessionId } from '../utils/validation';
import { logger } from '../utils/logger';

/**
 * Database query error with context
 */
export class QueryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'QueryError';
  }
}

/**
 * Inserts a new session or updates an existing one (upsert)
 * @param data - The parsed session data to insert
 * @throws QueryError if the operation fails
 */
export async function insertSession(data: ParsedSession): Promise<void> {
  try {
    validateSessionId(data.id);

    await db.insert(sessions).values({
      id: data.id,
      projectPath: data.project_path,
      projectName: data.project_name,
      sessionHash: data.session_hash,
      startedAt: data.started_at,
      lastActivityAt: data.last_activity_at,
      isActive: data.is_active,
      modelConfig: data.model_config,
      currentModel: data.current_model,
      hasSubagents: data.has_subagents,
    }).onConflictDoUpdate({
      target: sessions.id,
      set: {
        lastActivityAt: data.last_activity_at,
        isActive: data.is_active,
        currentModel: data.current_model,
        hasSubagents: data.has_subagents,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ sessionId: data.id, error: err.message }, 'Failed to insert session');
    throw new QueryError(`Failed to insert session ${data.id}`, err);
  }
}

/**
 * Inserts a new request record
 * @param data - The parsed request data to insert
 * @returns The ID of the inserted request
 * @throws QueryError if the operation fails
 */
export async function insertRequest(data: ParsedRequest): Promise<number> {
  try {
    validateSessionId(data.session_id);

    const result = await db.insert(requests).values({
      sessionId: data.session_id,
      requestId: data.request_id,
      timestamp: data.timestamp,
      model: data.model,
      role: data.role,
      inputTokens: data.input_tokens,
      outputTokens: data.output_tokens,
      cacheCreationTokens: data.cache_creation_tokens,
      cacheReadTokens: data.cache_read_tokens,
      totalTokens: data.total_tokens,
      estimatedCostUsd: data.estimated_cost_usd,
      cacheCreationEphemeral5m: data.cache_creation_ephemeral_5m,
      cacheCreationEphemeral1h: data.cache_creation_ephemeral_1h,
      isSubagent: data.is_subagent,
      agentId: data.agent_id,
      agentType: data.agent_type,
    }).returning({ id: requests.id });

    if (!result || result.length === 0) {
      throw new Error('No ID returned from insert');
    }

    return result[0].id;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ sessionId: data.session_id, error: err.message }, 'Failed to insert request');
    throw new QueryError(`Failed to insert request for session ${data.session_id}`, err);
  }
}

/**
 * Retrieves a session by ID
 * @param sessionId - The session ID to look up
 * @returns The session record or null if not found
 * @throws QueryError if the operation fails
 */
export async function getSession(sessionId: string): Promise<typeof sessions.$inferSelect | null> {
  try {
    validateSessionId(sessionId);

    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ sessionId, error: err.message }, 'Failed to get session');
    throw new QueryError(`Failed to get session ${sessionId}`, err);
  }
}

/**
 * Session with aggregated statistics
 */
export interface SessionWithStats {
  id: string;
  projectPath: string;
  projectName: string;
  sessionHash: string;
  startedAt: Date | null;
  lastActivityAt: Date | null;
  isActive: boolean | null;
  modelConfig: string;
  currentModel: string | null;
  hasSubagents: boolean | null;
  totalTokens: number | null;
  totalCost: number | null;
  requestCount: number | null;
}

/**
 * Retrieves all active sessions with aggregated token and cost statistics
 * @returns Array of active sessions with stats
 * @throws QueryError if the operation fails
 */
export async function getActiveSessions(): Promise<SessionWithStats[]> {
  try {
    const result = await db
      .select({
        id: sessions.id,
        projectPath: sessions.projectPath,
        projectName: sessions.projectName,
        sessionHash: sessions.sessionHash,
        startedAt: sessions.startedAt,
        lastActivityAt: sessions.lastActivityAt,
        isActive: sessions.isActive,
        modelConfig: sessions.modelConfig,
        currentModel: sessions.currentModel,
        hasSubagents: sessions.hasSubagents,
        totalTokens: sum(requests.totalTokens).mapWith(Number),
        totalCost: sum(requests.estimatedCostUsd).mapWith(Number),
        requestCount: count(requests.id).mapWith(Number),
      })
      .from(sessions)
      .leftJoin(requests, eq(requests.sessionId, sessions.id))
      .where(eq(sessions.isActive, true))
      .groupBy(sessions.id);

    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ error: err.message }, 'Failed to get active sessions');
    throw new QueryError('Failed to get active sessions', err);
  }
}

/**
 * Updates session activity timestamp and current state
 * @param sessionId - The session ID to update
 * @param updates - Activity updates including timestamp, model, and subagents flag
 * @throws QueryError if the operation fails
 */
export async function updateSessionActivity(
  sessionId: string,
  updates: {
    last_activity_at: Date;
    current_model: string | null;
    has_subagents: boolean;
  }
): Promise<void> {
  try {
    validateSessionId(sessionId);

    await db
      .update(sessions)
      .set({
        lastActivityAt: updates.last_activity_at,
        currentModel: updates.current_model,
        hasSubagents: updates.has_subagents,
        isActive: true,
      })
      .where(eq(sessions.id, sessionId));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ sessionId, error: err.message }, 'Failed to update session activity');
    throw new QueryError(`Failed to update session activity for ${sessionId}`, err);
  }
}
