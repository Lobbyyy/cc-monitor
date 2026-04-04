import type { TokenUsage, ModelPricing } from '../types';

/**
 * Model pricing data as of April 2026
 * Prices are in USD per token
 */
export const MODEL_PRICING: Readonly<Record<string, ModelPricing>> = {
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
} as const;

/**
 * Calculates the cost in USD for a request based on token usage
 * @param model - The model identifier (e.g., 'claude-sonnet-4-5-20250929')
 * @param usage - Token usage data from the API response
 * @returns Total cost in USD, or 0 if model is not found
 * @example
 * ```typescript
 * const cost = calculateCost('claude-sonnet-4-5-20250929', {
 *   input_tokens: 1000,
 *   output_tokens: 500,
 *   cache_creation_input_tokens: 0,
 *   cache_read_input_tokens: 0,
 * });
 * // Returns: 0.0105 (USD)
 * ```
 */
export function calculateCost(model: string, usage: TokenUsage): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    return 0;
  }

  const inputTokens: number = usage.input_tokens || 0;
  const outputTokens: number = usage.output_tokens || 0;
  const cacheCreationTokens: number = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens: number = usage.cache_read_input_tokens || 0;

  return (
    inputTokens * pricing.input +
    outputTokens * pricing.output +
    cacheCreationTokens * pricing.cache_write +
    cacheReadTokens * pricing.cache_read
  );
}

/**
 * Gets the pricing information for a specific model
 * @param model - The model identifier
 * @returns ModelPricing object or undefined if model not found
 */
export function getModelPricing(model: string): ModelPricing | undefined {
  return MODEL_PRICING[model];
}

/**
 * Checks if a model has pricing information available
 * @param model - The model identifier
 * @returns true if pricing data exists for the model
 */
export function hasModelPricing(model: string): boolean {
  return model in MODEL_PRICING;
}
