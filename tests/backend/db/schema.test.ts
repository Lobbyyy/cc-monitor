import { describe, it, expect } from 'vitest';
import { sessions, requests } from '../../../src/backend/db/schema';

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

describe('Database Schema - Requests Table', () => {
  it('should have correct requests table structure', () => {
    expect(requests).toBeDefined();
    expect(requests.id).toBeDefined();
    expect(requests.sessionId).toBeDefined();
    expect(requests.model).toBeDefined();
    expect(requests.inputTokens).toBeDefined();
    expect(requests.outputTokens).toBeDefined();
    expect(requests.estimatedCostUsd).toBeDefined();
    expect(requests.isSubagent).toBeDefined();
  });
});
