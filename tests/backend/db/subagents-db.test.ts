import { describe, it, expect, beforeEach } from 'vitest';
import { insertSubagent, getSubagentsBySession } from '../../../src/backend/db/subagents-db';
import { insertSession } from '../../../src/backend/db/queries';
import { db } from '../../../src/backend/db/index';
import { sessions, subagents } from '../../../src/backend/db/schema';

describe('Subagents Database Operations', () => {
  beforeEach(async () => {
    await db.delete(subagents);
    await db.delete(sessions);
  });

  it('should insert a sub-agent', async () => {
    await insertSession({
      id: 'parent-session',
      project_path: '/test',
      project_name: 'test',
      session_hash: 'hash1',
      started_at: new Date(),
      last_activity_at: new Date(),
      is_active: true,
      model_config: 'opusplan',
      current_model: null,
      has_subagents: true,
    });

    const id = await insertSubagent({
      session_id: 'parent-session',
      agent_id: 'a123abc',
      agent_type: 'planner',
      model: 'claude-opus-4-5-20251101',
      spawned_at: new Date(),
      total_tokens: 1000,
      total_cost_usd: 0.05,
      status: 'running',
    });

    expect(id).toBeGreaterThan(0);
  });

  it('should get sub-agents by session', async () => {
    await insertSession({
      id: 'parent-session-2',
      project_path: '/test',
      project_name: 'test',
      session_hash: 'hash2',
      started_at: new Date(),
      last_activity_at: new Date(),
      is_active: true,
      model_config: 'opusplan',
      current_model: null,
      has_subagents: true,
    });

    await insertSubagent({
      session_id: 'parent-session-2',
      agent_id: 'agent1',
      agent_type: 'planner',
      model: 'claude-opus-4-5-20251101',
      spawned_at: new Date(),
      total_tokens: 500,
      total_cost_usd: 0.02,
      status: 'completed',
    });

    await insertSubagent({
      session_id: 'parent-session-2',
      agent_id: 'agent2',
      agent_type: 'code-reviewer',
      model: 'claude-sonnet-4-5-20250929',
      spawned_at: new Date(),
      total_tokens: 300,
      total_cost_usd: 0.01,
      status: 'running',
    });

    const agents = await getSubagentsBySession('parent-session-2');
    expect(agents).toHaveLength(2);
    expect(agents[0].agentType).toBe('planner');
    expect(agents[1].agentType).toBe('code-reviewer');
  });
});
