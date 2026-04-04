import { describe, it, expect, beforeEach } from 'vitest';
import { ModelTransitionDetector } from '../../../src/backend/watcher/model-detector';
import { insertSession, insertRequest } from '../../../src/backend/db/queries';
import { db } from '../../../src/backend/db/index';
import { sessions, requests, modelTransitions } from '../../../src/backend/db/schema';

describe('ModelTransitionDetector', () => {
  const detector = new ModelTransitionDetector();

  beforeEach(async () => {
    await db.delete(modelTransitions);
    await db.delete(requests);
    await db.delete(sessions);
  });

  it('should detect first model as session_start', async () => {
    await insertSession({
      id: 'session-1',
      project_path: '/test',
      project_name: 'test',
      session_hash: 'hash1',
      started_at: new Date(),
      last_activity_at: new Date(),
      is_active: true,
      model_config: 'opusplan',
      current_model: null,
      has_subagents: false,
    });

    const transition = await detector.detectTransition(
      'session-1',
      'claude-opus-4-5-20251101'
    );

    expect(transition).toBeDefined();
    expect(transition?.from_model).toBeNull();
    expect(transition?.to_model).toBe('claude-opus-4-5-20251101');
    expect(transition?.trigger).toBe('session_start');
  });

  it('should detect model change', async () => {
    await insertSession({
      id: 'session-2',
      project_path: '/test',
      project_name: 'test',
      session_hash: 'hash2',
      started_at: new Date(),
      last_activity_at: new Date(),
      is_active: true,
      model_config: 'opusplan',
      current_model: null,
      has_subagents: false,
    });

    // First request with Opus
    await insertRequest({
      session_id: 'session-2',
      request_id: 'req_1',
      timestamp: new Date(),
      model: 'claude-opus-4-5-20251101',
      role: 'assistant',
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
    });

    // Second request with Sonnet (transition!)
    const transition = await detector.detectTransition(
      'session-2',
      'claude-sonnet-4-5-20250929'
    );

    expect(transition).toBeDefined();
    expect(transition?.from_model).toBe('claude-opus-4-5-20251101');
    expect(transition?.to_model).toBe('claude-sonnet-4-5-20250929');
    expect(transition?.trigger).toBe('unknown');
  });

  it('should return null when model unchanged', async () => {
    await insertSession({
      id: 'session-3',
      project_path: '/test',
      project_name: 'test',
      session_hash: 'hash3',
      started_at: new Date(),
      last_activity_at: new Date(),
      is_active: true,
      model_config: 'sonnet',
      current_model: null,
      has_subagents: false,
    });

    await insertRequest({
      session_id: 'session-3',
      request_id: 'req_1',
      timestamp: new Date(),
      model: 'claude-sonnet-4-5-20250929',
      role: 'assistant',
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
    });

    // Same model again - no transition
    const transition = await detector.detectTransition(
      'session-3',
      'claude-sonnet-4-5-20250929'
    );

    expect(transition).toBeNull();
  });
});
