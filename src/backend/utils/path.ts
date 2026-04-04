import { homedir } from 'os';
import { join } from 'path';

/**
 * Expands ~ to home directory in file paths
 */
export function expandPath(filePath: string): string {
  if (filePath.startsWith('~/')) {
    return join(homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Reads file content from a specific byte offset
 */
export async function readFromOffset(filePath: string, offset: number): Promise<string> {
  const file = Bun.file(filePath);
  const arrayBuffer = await file.arrayBuffer();
  const fullContent = new TextDecoder().decode(arrayBuffer);
  return fullContent.slice(offset);
}
