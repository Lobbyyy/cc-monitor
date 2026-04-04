import { describe, it, expect } from 'vitest';
import { expandPath } from '../../../src/backend/utils/path';
import { homedir } from 'os';

describe('Path Utilities', () => {
  it('should expand ~ to home directory', () => {
    const result = expandPath('~/test/path');
    expect(result).toBe(`${homedir()}/test/path`);
  });

  it('should handle paths without ~', () => {
    const result = expandPath('/absolute/path');
    expect(result).toBe('/absolute/path');
  });

  it('should handle relative paths', () => {
    const result = expandPath('./relative/path');
    expect(result).toBe('./relative/path');
  });
});
