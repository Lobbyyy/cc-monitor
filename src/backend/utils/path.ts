import { homedir } from 'os';
import { join, resolve, normalize } from 'path';

/**
 * Expands ~ to home directory in file paths with security validation
 * @param filePath - The file path to expand
 * @returns The expanded file path
 * @throws Error if path traversal is detected
 */
export function expandPath(filePath: string): string {
  // Decode any URL-encoded characters
  const decodedPath = decodeURIComponent(filePath);

  if (decodedPath.startsWith('~/')) {
    const home = homedir();
    const relativePath = decodedPath.slice(2);
    const fullPath = resolve(join(home, relativePath));
    const normalizedPath = normalize(fullPath);

    // Security: Ensure the resolved path is within home directory
    if (!normalizedPath.startsWith(home)) {
      throw new Error('Invalid path: attempted directory traversal');
    }

    return normalizedPath;
  }

  return decodedPath;
}

/**
 * Reads file content from a specific byte offset efficiently
 * @param filePath - Path to the file
 * @param offset - Byte offset to start reading from
 * @returns The file content from the offset
 */
export async function readFromOffset(filePath: string, offset: number): Promise<string> {
  const file = Bun.file(filePath);
  const size = file.size;

  if (offset >= size) {
    return '';
  }

  // Use slice for memory efficiency - only load needed portion
  const slice = file.slice(offset, size);
  return await slice.text();
}
