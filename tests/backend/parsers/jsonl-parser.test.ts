import { describe, it, expect } from 'vitest';
import { parseJsonlEntry, shouldProcessEntry, extractProjectName } from '../../../src/backend/parsers/jsonl-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('JSONL Parser', () => {
  const samplePath = join(__dirname, '../../fixtures/sample.jsonl');
  const lines = readFileSync(samplePath, 'utf-8').split('\n').filter(Boolean);

  describe('shouldProcessEntry', () => {
    it('should skip user messages', () => {
      const entry = JSON.parse(lines[0]);
      expect(shouldProcessEntry(entry)).toBe(false);
    });

    it('should process assistant messages', () => {
      const entry = JSON.parse(lines[1]);
      expect(shouldProcessEntry(entry)).toBe(true);
    });

    it('should skip entries without model/usage', () => {
      const entry = {
        type: 'assistant',
        sessionId: 'test-session',
        timestamp: '2024-01-01T00:00:00Z',
        message: {
          role: 'assistant' as const
        }
      };
      expect(shouldProcessEntry(entry)).toBe(false);
    });
  });

  describe('extractProjectName', () => {
    it('should extract project name from path', () => {
      const name = extractProjectName('/Users/test/Desktop/apps/my-project');
      expect(name).toBe('my-project');
    });

    it('should handle trailing slash', () => {
      const name = extractProjectName('/Users/test/project/');
      expect(name).toBe('project');
    });
  });

  describe('parseJsonlEntry', () => {
    it('should parse main session assistant message', () => {
      const entry = JSON.parse(lines[1]);
      const result = parseJsonlEntry(entry);

      expect(result).toBeDefined();
      expect(result?.session_id).toBe('abc123');
      expect(result?.model).toBe('claude-sonnet-4-5-20250929');
      expect(result?.input_tokens).toBe(100);
      expect(result?.output_tokens).toBe(50);
      expect(result?.cache_creation_tokens).toBe(500);
      expect(result?.is_subagent).toBe(false);
      expect(result?.estimated_cost_usd).toBeGreaterThan(0);
    });

    it('should parse sub-agent message', () => {
      const entry = JSON.parse(lines[3]);
      const result = parseJsonlEntry(entry);

      expect(result).toBeDefined();
      expect(result?.is_subagent).toBe(true);
      expect(result?.agent_id).toBe('a123abc');
      expect(result?.model).toBe('claude-opus-4-5-20251101');
    });

    it('should return null for user messages', () => {
      const entry = JSON.parse(lines[0]);
      const result = parseJsonlEntry(entry);
      expect(result).toBeNull();
    });
  });
});
