import { describe, it, expect, beforeEach } from 'vitest';
import { SessionTracker } from '../../../src/backend/watcher/session-tracker';
import { getSession } from '../../../src/backend/db/queries';
import { db } from '../../../src/backend/db/index';
import { sessions } from '../../../src/backend/db/schema';

describe('SessionTracker', () => {
  const tracker = new SessionTracker();

  beforeEach(async () => {
    await db.delete(sessions);
  });

  it('should create new session if not exists', async () => {
    await tracker.updateActivity({
      sessionId: 'new-session',
      projectPath: '/Users/test/project',
      modelConfig: 'opusplan',
      currentModel: 'claude-opus-4-5-20251101',
      hasSubagents: false,
    });

    const session = await getSession('new-session');
    expect(session).toBeDefined();
    expect(session?.id).toBe('new-session');
    expect(session?.projectName).toBe('project');
    expect(session?.isActive).toBe(true);
  });

  it('should update existing session activity', async () => {
    // Create session
    await tracker.updateActivity({
      sessionId: 'existing-session',
      projectPath: '/Users/test/project',
      modelConfig: 'sonnet',
      currentModel: 'claude-sonnet-4-5-20250929',
      hasSubagents: false,
    });

    const before = await getSession('existing-session');
    const beforeTime = before?.lastActivityAt;

    // Allow time for timestamp to change (SQLite has second-level precision)
    const TIMESTAMP_RESOLUTION_DELAY_MS = 100;
    await new Promise(resolve => setTimeout(resolve, TIMESTAMP_RESOLUTION_DELAY_MS));

    // Update activity
    await tracker.updateActivity({
      sessionId: 'existing-session',
      projectPath: '/Users/test/project',
      modelConfig: 'sonnet',
      currentModel: 'claude-opus-4-5-20251101', // Model changed
      hasSubagents: true, // Sub-agent added
    });

    const after = await getSession('existing-session');
    expect(after?.lastActivityAt.getTime()).toBeGreaterThanOrEqual(beforeTime!.getTime());
    expect(after?.currentModel).toBe('claude-opus-4-5-20251101');
    expect(after?.hasSubagents).toBe(true);
  });
});
