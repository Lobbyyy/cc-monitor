import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/**
 * Ensures a directory exists, creating it recursively if needed
 * @param filePath - Path to a file (directory will be extracted)
 */
export function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
