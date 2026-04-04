import { describe, it, expect, beforeEach } from 'vitest';
import { parseJsonlEntry, extractProjectName } from '../../src/backend/parsers/jsonl-parser';
import { insertSession, insertRequest, getActiveSessions } from '../../src/backend/db/queries';
import { db } from '../../src/backend/db/index';
import { sessions, requests } from '../../src/backend/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Integration: JSONL to Database', () => {
  beforeEach(async () => {
    await db.delete(requests);
    await db.delete(sessions);
  });

  it('should parse JSONL file and store in database', async () => {
    const samplePath = join(__dirname, '../fixtures/sample.jsonl');
    const lines = readFileSync(samplePath, 'utf-8').split('\n').filter(Boolean);

    // Process each line
    for (const line of lines) {
      const entry = JSON.parse(line);
      const parsed = parseJsonlEntry(entry);

      if (parsed) {
        // Create/update session
        await insertSession({
          id: parsed.session_id,
          project_path: entry.cwd || '/unknown',
          project_name: extractProjectName(entry.cwd || '/unknown'),
          session_hash: 'test-hash',
          started_at: parsed.timestamp,
          last_activity_at: parsed.timestamp,
          is_active: true,
          model_config: 'auto',
          current_model: parsed.model,
          has_subagents: parsed.is_subagent,
        });

        // Insert request
        await insertRequest(parsed);
      }
    }

    // Verify data
    const activeSessions = await getActiveSessions();
    expect(activeSessions).toHaveLength(1);

    const session = activeSessions[0];
    expect(session.id).toBe('abc123');
    expect(session.requestCount).toBe(2); // 2 assistant messages in fixture
    expect(session.totalTokens).toBeGreaterThan(0);
    expect(session.totalCost).toBeGreaterThan(0);
  });

  it('should handle sub-agent requests correctly', async () => {
    const samplePath = join(__dirname, '../fixtures/sample.jsonl');
    const lines = readFileSync(samplePath, 'utf-8').split('\n').filter(Boolean);

    for (const line of lines) {
      const entry = JSON.parse(line);
      const parsed = parseJsonlEntry(entry);

      if (parsed) {
        await insertSession({
          id: parsed.session_id,
          project_path: '/test',
          project_name: 'test',
          session_hash: 'hash',
          started_at: parsed.timestamp,
          last_activity_at: parsed.timestamp,
          is_active: true,
          model_config: 'auto',
          current_model: parsed.model,
          has_subagents: parsed.is_subagent,
        });

        await insertRequest(parsed);
      }
    }

    // Check sub-agent request exists
    const subagentRequests = await db
      .select()
      .from(requests)
      .where(eq(requests.isSubagent, true));

    expect(subagentRequests).toHaveLength(1);
    expect(subagentRequests[0].agentId).toBe('a123abc');
    expect(subagentRequests[0].model).toBe('claude-opus-4-5-20251101');
  });
});
