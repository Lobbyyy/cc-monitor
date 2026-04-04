import { describe, it, expect } from 'vitest';
import { validateSessionId, validateModel, validateNonEmptyString } from '../../../src/backend/utils/validation';

describe('Validation Utilities', () => {
  describe('validateSessionId', () => {
    it('should accept valid session ID', () => {
      expect(() => validateSessionId('abc-123-def')).not.toThrow();
    });

    it('should reject empty session ID', () => {
      expect(() => validateSessionId('')).toThrow('Session ID cannot be empty');
    });

    it('should reject null/undefined', () => {
      expect(() => validateSessionId(null as any)).toThrow('Session ID must be a string');
      expect(() => validateSessionId(undefined as any)).toThrow('Session ID must be a string');
    });
  });

  describe('validateModel', () => {
    it('should accept valid model name', () => {
      expect(() => validateModel('claude-sonnet-4-5-20250929')).not.toThrow();
    });

    it('should reject empty model name', () => {
      expect(() => validateModel('')).toThrow('Model name cannot be empty');
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept non-empty string', () => {
      expect(() => validateNonEmptyString('test', 'field')).not.toThrow();
    });

    it('should reject empty string', () => {
      expect(() => validateNonEmptyString('', 'field')).toThrow('field cannot be empty');
    });

    it('should reject non-string values', () => {
      expect(() => validateNonEmptyString(123 as any, 'field')).toThrow('field must be a string');
    });
  });
});
