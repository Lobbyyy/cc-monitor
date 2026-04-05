import type { JsonlEntry, ParsedRequest, MessageContent } from '../types';
import { AgentType } from '../types';
import { calculateCost } from '../utils/pricing';

/**
 * Determines if a JSONL entry should be processed.
 * Only processes assistant messages with model and usage data.
 * @param entry - The JSONL entry to check
 * @returns true if the entry should be processed
 */
export function shouldProcessEntry(entry: JsonlEntry): boolean {
  if (entry.type !== 'assistant') return false;
  if (!entry.message?.model) return false;
  if (!entry.message?.usage) return false;
  return true;
}

/**
 * Extracts project name from a file path
 * @param path - The full file path
 * @returns The project name (last directory segment)
 */
export function extractProjectName(path: string): string {
  const cleaned = path.endsWith('/') ? path.slice(0, -1) : path;
  const parts = cleaned.split('/');
  return parts[parts.length - 1];
}

/**
 * Infers agent type from task content or known patterns
 * @param agentId - The agent ID
 * @param entry - The JSONL entry
 * @returns The inferred agent type
 */
function inferAgentType(agentId: string, entry: JsonlEntry): AgentType {
  const content = stringifyContent(entry.message?.content);
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('plan') || lowerContent.includes('implementation plan')) {
    return AgentType.PLANNER;
  }
  if (lowerContent.includes('review') || lowerContent.includes('code quality')) {
    return AgentType.CODE_REVIEWER;
  }
  if (lowerContent.includes('test') || lowerContent.includes('tdd')) {
    return AgentType.TDD_GUIDE;
  }
  if (lowerContent.includes('architect') || lowerContent.includes('system design')) {
    return AgentType.ARCHITECT;
  }
  if (lowerContent.includes('explore') || lowerContent.includes('search')) {
    return AgentType.EXPLORER;
  }

  return AgentType.UNKNOWN;
}

/**
 * Safely stringify message content for analysis
 * @param content - The message content
 * @returns String representation of the content
 */
function stringifyContent(content: MessageContent[] | string | undefined): string {
  if (!content) return '';
  if (typeof content === 'string') return content;

  return content
    .map((item) => {
      if (item.type === 'text') return item.text;
      if (item.type === 'tool_use') return item.name + ': ' + JSON.stringify(item.input);
      return '';
    })
    .join(' ');
}

/**
 * Parses a JSONL entry into structured request data for database insertion
 * @param entry - The JSONL entry to parse
 * @returns ParsedRequest object or null if entry should not be processed
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

  const agentType = entry.isSidechain ? inferAgentType(entry.agentId || '', entry) : null;

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
    agent_type: agentType,
  };
}
