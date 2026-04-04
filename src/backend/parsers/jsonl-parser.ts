import type { JsonlEntry, ParsedRequest } from '../types';
import { calculateCost } from '../utils/pricing';

/**
 * Determines if a JSONL entry should be processed
 * Only process assistant messages with model and usage data
 */
export function shouldProcessEntry(entry: JsonlEntry): boolean {
  if (entry.type !== 'assistant') return false;
  if (!entry.message?.model) return false;
  if (!entry.message?.usage) return false;
  return true;
}

/**
 * Extract project name from file path
 */
export function extractProjectName(path: string): string {
  const cleaned = path.endsWith('/') ? path.slice(0, -1) : path;
  const parts = cleaned.split('/');
  return parts[parts.length - 1];
}

/**
 * Infer agent type from task content or known patterns
 */
export function inferAgentType(agentId: string, entry: JsonlEntry): string {
  const content = JSON.stringify(entry.message?.content || '').toLowerCase();

  if (content.includes('plan') || content.includes('implementation plan')) {
    return 'planner';
  }
  if (content.includes('review') || content.includes('code quality')) {
    return 'code-reviewer';
  }
  if (content.includes('test') || content.includes('tdd')) {
    return 'tdd-guide';
  }
  if (content.includes('architect') || content.includes('system design')) {
    return 'architect';
  }

  return 'unknown';
}

/**
 * Parse a JSONL entry into structured request data
 */
export function parseJsonlEntry(entry: JsonlEntry): ParsedRequest | null {
  if (!shouldProcessEntry(entry)) {
    return null;
  }

  const usage = entry.message!.usage!;
  const model = entry.message!.model!;

  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens = usage.cache_read_input_tokens || 0;

  const cost = calculateCost(model, usage);

  return {
    session_id: entry.sessionId,
    request_id: entry.requestId || '',
    timestamp: new Date(entry.timestamp),
    model,
    role: 'assistant',
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_creation_tokens: cacheCreationTokens,
    cache_read_tokens: cacheReadTokens,
    total_tokens: inputTokens + outputTokens,
    estimated_cost_usd: cost,
    cache_creation_ephemeral_5m: usage.cache_creation?.ephemeral_5m_input_tokens || 0,
    cache_creation_ephemeral_1h: usage.cache_creation?.ephemeral_1h_input_tokens || 0,
    is_subagent: entry.isSidechain || false,
    agent_id: entry.agentId || null,
    agent_type: entry.isSidechain ? inferAgentType(entry.agentId || '', entry) : null,
  };
}
