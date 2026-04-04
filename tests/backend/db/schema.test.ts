import { describe, it, expect } from 'vitest';
import { sessions } from '../../../src/backend/db/schema';

describe('Database Schema - Sessions Table', () => {
  it('should have correct session table structure', () => {
    expect(sessions).toBeDefined();
    expect(sessions.id).toBeDefined();
    expect(sessions.projectPath).toBeDefined();
    expect(sessions.projectName).toBeDefined();
    expect(sessions.isActive).toBeDefined();
    expect(sessions.modelConfig).toBeDefined();
  });
});
