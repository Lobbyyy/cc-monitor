import { db } from './index';
import { subagents } from './schema';
import { eq } from 'drizzle-orm';

export interface SubagentData {
  session_id: string;
  agent_id: string;
  agent_type: string;
  model: string;
  spawned_at: Date;
  total_tokens: number;
  total_cost_usd: number;
  status: 'running' | 'completed' | 'failed';
  completed_at?: Date;
}

/**
 * Insert a sub-agent record
 */
export async function insertSubagent(data: SubagentData): Promise<number> {
  const result = await db.insert(subagents).values({
    sessionId: data.session_id,
    agentId: data.agent_id,
    agentType: data.agent_type,
    model: data.model,
    spawnedAt: data.spawned_at,
    completedAt: data.completed_at || null,
    totalTokens: data.total_tokens,
    totalCostUsd: data.total_cost_usd,
    status: data.status,
  }).returning({ id: subagents.id });

  return result[0].id;
}

/**
 * Get all sub-agents for a session
 */
export async function getSubagentsBySession(sessionId: string) {
  return await db
    .select()
    .from(subagents)
    .where(eq(subagents.sessionId, sessionId));
}

/**
 * Update sub-agent when it completes
 */
export async function completeSubagent(
  agentId: string,
  totalTokens: number,
  totalCost: number
): Promise<void> {
  await db
    .update(subagents)
    .set({
      status: 'completed',
      completedAt: new Date(),
      totalTokens,
      totalCostUsd: totalCost,
    })
    .where(eq(subagents.agentId, agentId));
}
