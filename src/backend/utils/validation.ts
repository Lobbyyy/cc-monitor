/**
 * Validates that a value is a non-empty string
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if validation fails
 */
export function validateNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates a session ID
 * @param sessionId - The session ID to validate
 * @throws Error if validation fails
 */
export function validateSessionId(sessionId: unknown): asserts sessionId is string {
  validateNonEmptyString(sessionId, 'Session ID');
}

/**
 * Validates a model name
 * @param model - The model name to validate
 * @throws Error if validation fails
 */
export function validateModel(model: unknown): asserts model is string {
  validateNonEmptyString(model, 'Model name');
}
