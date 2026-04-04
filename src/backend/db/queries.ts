import { eq, sum, count } from 'drizzle-orm';
import { db } from './index';
import { sessions, requests } from './schema';
import type { ParsedSession, ParsedRequest } from '../types';

/**
 * Insert a new session or update if exists
 */
export async function insertSession(data: ParsedSession): Promise<void> {
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
}

/**
 * Insert a new request
 */
export async function insertRequest(data: ParsedRequest): Promise<number> {
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

  return result[0].id;
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string) {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get all active sessions with aggregated stats
 */
export async function getActiveSessions() {
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
}
