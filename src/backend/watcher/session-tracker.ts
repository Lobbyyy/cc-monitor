import { db } from '../db/index';
import { sessions } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { getSession, insertSession, updateSessionActivity } from '../db/queries';
import { extractProjectName } from '../parsers/jsonl-parser';

export interface SessionActivityUpdate {
  sessionId: string;
  projectPath: string;
  modelConfig: string;
  currentModel: string | null;
  hasSubagents: boolean;
}

export class SessionTracker {
  /**
   * Update session activity - create if new, update if exists
   */
  async updateActivity(update: SessionActivityUpdate): Promise<void> {
    const existing = await getSession(update.sessionId);
    const now = new Date();

    if (!existing) {
      // Create new session
      await insertSession({
        id: update.sessionId,
        project_path: update.projectPath,
        project_name: extractProjectName(update.projectPath),
        session_hash: this.extractSessionHash(update.projectPath),
        started_at: now,
        last_activity_at: now,
        is_active: true,
        model_config: update.modelConfig,
        current_model: update.currentModel,
        has_subagents: update.hasSubagents,
      });
    } else {
      // Update existing session
      await updateSessionActivity(update.sessionId, {
        last_activity_at: now,
        current_model: update.currentModel,
        has_subagents: update.hasSubagents,
      });
    }
  }

  /**
   * Extract session hash from project path
   * Path format: ~/.claude/projects/<hash>/<session-id>.jsonl
   */
  private extractSessionHash(projectPath: string): string {
    // For now, return a placeholder
    // In Plan 3, we'll improve this to extract from actual file path
    return 'unknown';
  }

  /**
   * Mark sessions inactive if no activity for 30 minutes
   */
  async markInactiveSessions(): Promise<void> {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    await db
      .update(sessions)
      .set({ isActive: false })
      .where(
        and(
          eq(sessions.isActive, true),
          lt(sessions.lastActivityAt, thirtyMinAgo)
        )
      );
  }
}
