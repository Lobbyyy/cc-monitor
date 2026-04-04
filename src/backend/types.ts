/**
 * Supported agent types for Claude Code sub-agents
 */
export enum AgentType {
  PLANNER = 'planner',
  CODE_REVIEWER = 'code-reviewer',
  TDD_GUIDE = 'tdd-guide',
  ARCHITECT = 'architect',
  EXPLORER = 'explorer',
  UNKNOWN = 'unknown',
}

/**
 * Model pricing structure ($ per token)
 */
export interface ModelPricing {
  /** Cost per input token */
  input: number;
  /** Cost per output token */
  output: number;
  /** Cost per cache write token */
  cache_write: number;
  /** Cost per cache read token */
  cache_read: number;
}

/**
 * Token usage data from Claude API response
 */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation?: {
    ephemeral_5m_input_tokens?: number;
    ephemeral_1h_input_tokens?: number;
  };
}

/**
 * Message content types from Claude API
 */
export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string };

/**
 * JSONL entry structure from Claude Code logs
 */
export interface JsonlEntry {
  type: 'user' | 'assistant' | string;
  sessionId: string;
  requestId?: string;
  timestamp: string;
  cwd?: string;
  isSidechain?: boolean;
  agentId?: string;
  slug?: string;
  message?: {
    role: 'user' | 'assistant';
    model?: string;
    usage?: TokenUsage;
    content?: MessageContent[] | string;
  };
}

/**
 * Parsed request data for database insertion
 */
export interface ParsedRequest {
  session_id: string;
  request_id: string;
  timestamp: Date;
  model: string;
  role: 'user' | 'assistant';
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  cache_creation_ephemeral_5m: number;
  cache_creation_ephemeral_1h: number;
  is_subagent: boolean;
  agent_id: string | null;
  agent_type: string | null;
}

/**
 * Parsed session data for database insertion
 */
export interface ParsedSession {
  id: string;
  project_path: string;
  project_name: string;
  session_hash: string;
  started_at: Date;
  last_activity_at: Date;
  is_active: boolean;
  model_config: string;
  current_model: string | null;
  has_subagents: boolean;
}
