import { describe, it, expect, beforeEach } from 'vitest';
import { insertSession, insertRequest, getSession } from '../../../src/backend/db/queries';
import { db } from '../../../src/backend/db/index';
import { sessions, requests } from '../../../src/backend/db/schema';

describe('Database Queries', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.delete(requests);
    await db.delete(sessions);
  });

  describe('insertSession', () => {
    it('should insert a new session', async () => {
      const sessionData = {
        id: 'test-session-1',
        project_path: '/Users/test/project',
        project_name: 'project',
        session_hash: 'hash123',
        started_at: new Date(),
        last_activity_at: new Date(),
        is_active: true,
        model_config: 'opusplan',
        current_model: 'claude-sonnet-4-5-20250929',
        has_subagents: false,
      };

      await insertSession(sessionData);

      const retrieved = await getSession('test-session-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-session-1');
      expect(retrieved?.projectName).toBe('project');
      expect(retrieved?.modelConfig).toBe('opusplan');
    });
  });

  describe('insertRequest', () => {
    it('should insert a new request', async () => {
      // First insert session
      await insertSession({
        id: 'test-session-2',
        project_path: '/Users/test/project',
        project_name: 'project',
        session_hash: 'hash123',
        started_at: new Date(),
        last_activity_at: new Date(),
        is_active: true,
        model_config: 'sonnet',
        current_model: null,
        has_subagents: false,
      });

      const requestData = {
        session_id: 'test-session-2',
        request_id: 'req_001',
        timestamp: new Date(),
        model: 'claude-sonnet-4-5-20250929',
        role: 'assistant' as const,
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_tokens: 0,
        cache_read_tokens: 0,
        total_tokens: 150,
        estimated_cost_usd: 0.001,
        cache_creation_ephemeral_5m: 0,
        cache_creation_ephemeral_1h: 0,
        is_subagent: false,
        agent_id: null,
        agent_type: null,
      };

      const id = await insertRequest(requestData);
      expect(id).toBeGreaterThan(0);
    });
  });
});
