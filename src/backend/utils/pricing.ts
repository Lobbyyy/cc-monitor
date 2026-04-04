import type { TokenUsage, ModelPricing } from '../types';

// Pricing as of April 2026
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-opus-4-5-20251101': {
    input: 0.015 / 1000,        // $15 per 1M tokens
    output: 0.075 / 1000,       // $75 per 1M tokens
    cache_write: 0.01875 / 1000, // $18.75 per 1M tokens
    cache_read: 0.0015 / 1000,  // $1.50 per 1M tokens
  },
  'claude-sonnet-4-5-20250929': {
    input: 0.003 / 1000,        // $3 per 1M tokens
    output: 0.015 / 1000,       // $15 per 1M tokens
    cache_write: 0.00375 / 1000,
    cache_read: 0.0003 / 1000,
  },
  'claude-haiku-3-5-20241022': {
    input: 0.0008 / 1000,       // $0.80 per 1M tokens
    output: 0.004 / 1000,       // $4 per 1M tokens
    cache_write: 0.001 / 1000,
    cache_read: 0.00008 / 1000,
  },
};

/**
 * Calculate cost in USD for a request based on token usage
 */
export function calculateCost(model: string, usage: TokenUsage): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;

  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens = usage.cache_read_input_tokens || 0;

  return (
    (inputTokens * pricing.input) +
    (outputTokens * pricing.output) +
    (cacheCreationTokens * pricing.cache_write) +
    (cacheReadTokens * pricing.cache_read)
  );
}
