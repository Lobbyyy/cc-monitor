import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileWatcher } from '../../src/backend/watcher/file-watcher';
import { getActiveSessions } from '../../src/backend/db/queries';
import { db } from '../../src/backend/db/index';
import { sessions, requests, modelTransitions } from '../../src/backend/db/schema';
import { writeFileSync, mkdirSync, rmSync, appendFileSync } from 'fs';
import { join } from 'path';

describe('Integration: File Watcher', () => {
  const testDir = join(__dirname, '../tmp/watch-test');
  const testFile = join(testDir, 'session-1.jsonl');
  let watcher: FileWatcher;

  beforeEach(async () => {
    await db.delete(requests);
    await db.delete(sessions);

    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });

    watcher = new FileWatcher(testDir);
  });

  afterEach(() => {
    watcher?.stop();
  });

  it('should process new JSONL entries when file is updated', async () => {
    // Write initial entry
    const entry1 = JSON.stringify({
      type: 'assistant',
      sessionId: 'test-session-1',
      requestId: 'req_001',
      timestamp: new Date().toISOString(),
      cwd: '/Users/test/project',
      message: {
        model: 'claude-sonnet-4-5-20250929',
        role: 'assistant',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
      },
    });

    writeFileSync(testFile, entry1 + '\n');

    // Start watcher
    await watcher.start();

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check database
    const activeSessions = await getActiveSessions();
    expect(activeSessions).toHaveLength(1);
    expect(activeSessions[0].requestCount).toBe(1);

    // Append another entry
    const entry2 = JSON.stringify({
      type: 'assistant',
      sessionId: 'test-session-1',
      requestId: 'req_002',
      timestamp: new Date().toISOString(),
      cwd: '/Users/test/project',
      message: {
        model: 'claude-sonnet-4-5-20250929',
        role: 'assistant',
        usage: {
          input_tokens: 200,
          output_tokens: 100,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
      },
    });

    appendFileSync(testFile, entry2 + '\n');

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check updated count
    const updated = await getActiveSessions();
    expect(updated[0].requestCount).toBe(2);
  });

  it('should detect model transitions', async () => {
    const entry1 = JSON.stringify({
      type: 'assistant',
      sessionId: 'transition-test',
      requestId: 'req_001',
      timestamp: new Date().toISOString(),
      cwd: '/test',
      message: {
        model: 'claude-opus-4-5-20251101',
        role: 'assistant',
        usage: { input_tokens: 100, output_tokens: 50 },
      },
    });

    const entry2 = JSON.stringify({
      type: 'assistant',
      sessionId: 'transition-test',
      requestId: 'req_002',
      timestamp: new Date().toISOString(),
      cwd: '/test',
      message: {
        model: 'claude-sonnet-4-5-20250929',  // Model changed!
        role: 'assistant',
        usage: { input_tokens: 100, output_tokens: 50 },
      },
    });

    writeFileSync(testFile, entry1 + '\n' + entry2 + '\n');

    await watcher.start();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check transitions table
    const transitions = await db.select().from(modelTransitions);
    expect(transitions.length).toBeGreaterThanOrEqual(2); // session_start + transition
  });
});
