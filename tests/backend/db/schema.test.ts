import { describe, it, expect } from 'vitest';
import { sessions, requests, modelTransitions, subagents } from '../../../src/backend/db/schema';

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

describe('Database Schema - Model Transitions Table', () => {
  it('should have correct model_transitions table structure', () => {
    expect(modelTransitions).toBeDefined();
    expect(modelTransitions.sessionId).toBeDefined();
    expect(modelTransitions.fromModel).toBeDefined();
    expect(modelTransitions.toModel).toBeDefined();
    expect(modelTransitions.trigger).toBeDefined();
  });
});

describe('Database Schema - Subagents Table', () => {
  it('should have correct subagents table structure', () => {
    expect(subagents).toBeDefined();
    expect(subagents.sessionId).toBeDefined();
    expect(subagents.agentId).toBeDefined();
    expect(subagents.agentType).toBeDefined();
    expect(subagents.model).toBeDefined();
    expect(subagents.totalTokens).toBeDefined();
  });
});
