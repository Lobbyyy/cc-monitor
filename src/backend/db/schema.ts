import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  projectPath: text('project_path').notNull(),
  projectName: text('project_name').notNull(),
  sessionHash: text('session_hash').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  modelConfig: text('model_config').notNull(),
  currentModel: text('current_model'),
  hasSubagents: integer('has_subagents', { mode: 'boolean' }).default(false),
}, (table) => ({
  isActiveIdx: index('idx_sessions_is_active').on(table.isActive),
  projectNameIdx: index('idx_sessions_project_name').on(table.projectName),
  lastActivityIdx: index('idx_sessions_last_activity').on(table.lastActivityAt),
}));
