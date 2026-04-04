// Model pricing structure
export interface ModelPricing {
  input: number;        // $ per token
  output: number;       // $ per token
  cache_write: number;  // $ per token
  cache_read: number;   // $ per token
}

// Token usage from JSONL
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

// JSONL entry structure (from Claude Code)
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
    content?: any;
  };
}

// Parsed request data for DB insertion
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

// Parsed session data
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
