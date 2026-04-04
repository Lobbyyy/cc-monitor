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

export const requests = sqliteTable('requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  requestId: text('request_id').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),

  model: text('model').notNull(),
  role: text('role').notNull(),

  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  cacheCreationTokens: integer('cache_creation_tokens').default(0),
  cacheReadTokens: integer('cache_read_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  estimatedCostUsd: integer('estimated_cost_usd', { mode: 'number' }).default(0),

  cacheCreationEphemeral5m: integer('cache_creation_ephemeral_5m').default(0),
  cacheCreationEphemeral1h: integer('cache_creation_ephemeral_1h').default(0),

  isSubagent: integer('is_subagent', { mode: 'boolean' }).default(false),
  agentId: text('agent_id'),
  agentType: text('agent_type'),
}, (table) => ({
  sessionIdIdx: index('idx_requests_session_id').on(table.sessionId),
  timestampIdx: index('idx_requests_timestamp').on(table.timestamp),
  modelIdx: index('idx_requests_model').on(table.model),
  isSubagentIdx: index('idx_requests_is_subagent').on(table.isSubagent),
}));
