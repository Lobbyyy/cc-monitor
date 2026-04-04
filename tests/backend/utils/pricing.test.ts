import { describe, it, expect } from 'vitest';
import { calculateCost, MODEL_PRICING } from '../../../src/backend/utils/pricing';

describe('Cost Calculator', () => {
  describe('Opus 4.5 pricing', () => {
    it('should calculate input token cost correctly', () => {
      const cost = calculateCost('claude-opus-4-5-20251101', {
        input_tokens: 1000,
        output_tokens: 0,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      });

      // $15 per 1M tokens = $0.015 per 1K tokens
      expect(cost).toBeCloseTo(0.015, 6);
    });

    it('should calculate output token cost correctly', () => {
      const cost = calculateCost('claude-opus-4-5-20251101', {
        input_tokens: 0,
        output_tokens: 1000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      });

      // $75 per 1M tokens = $0.075 per 1K tokens
      expect(cost).toBeCloseTo(0.075, 6);
    });

    it('should calculate combined cost correctly', () => {
      const cost = calculateCost('claude-opus-4-5-20251101', {
        input_tokens: 10000,
        output_tokens: 5000,
        cache_creation_input_tokens: 2000,
        cache_read_input_tokens: 1000,
      });

      const expected =
        (10000 * 0.015 / 1000) +      // input
        (5000 * 0.075 / 1000) +        // output
        (2000 * 0.01875 / 1000) +      // cache write
        (1000 * 0.0015 / 1000);        // cache read

      expect(cost).toBeCloseTo(expected, 6);
    });
  });

  describe('Sonnet 4.5 pricing', () => {
    it('should use correct Sonnet pricing', () => {
      const cost = calculateCost('claude-sonnet-4-5-20250929', {
        input_tokens: 1000,
        output_tokens: 1000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      });

      const expected =
        (1000 * 0.003 / 1000) +  // $3 per 1M input
        (1000 * 0.015 / 1000);   // $15 per 1M output

      expect(cost).toBeCloseTo(expected, 6);
    });
  });

  describe('Haiku pricing', () => {
    it('should use correct Haiku pricing', () => {
      const cost = calculateCost('claude-haiku-3-5-20241022', {
        input_tokens: 1000,
        output_tokens: 1000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      });

      const expected =
        (1000 * 0.0008 / 1000) +  // $0.80 per 1M input
        (1000 * 0.004 / 1000);    // $4 per 1M output

      expect(cost).toBeCloseTo(expected, 6);
    });
  });

  describe('Unknown model', () => {
    it('should return 0 for unknown model', () => {
      const cost = calculateCost('unknown-model', {
        input_tokens: 1000,
        output_tokens: 1000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      });

      expect(cost).toBe(0);
    });
  });
});
