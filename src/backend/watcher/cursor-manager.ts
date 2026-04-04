import { readFromOffset } from '../utils/path';
import { statSync } from 'fs';

/**
 * Manages file read cursors to only process new content
 */
export class CursorManager {
  private cursors = new Map<string, number>();

  /**
   * Get current cursor position for a file
   */
  getCursor(filePath: string): number {
    return this.cursors.get(filePath) || 0;
  }

  /**
   * Update cursor position for a file
   */
  updateCursor(filePath: string, position: number): void {
    this.cursors.set(filePath, position);
  }

  /**
   * Read only new content since last cursor position
   * and update cursor to current file size
   */
  async readNewContent(filePath: string): Promise<string> {
    const cursor = this.getCursor(filePath);
    const newContent = await readFromOffset(filePath, cursor);

    // Update cursor to current file size
    const stats = statSync(filePath);
    this.updateCursor(filePath, stats.size);

    return newContent;
  }

  /**
   * Reset cursor for a file (useful for testing)
   */
  resetCursor(filePath: string): void {
    this.cursors.delete(filePath);
  }

  /**
   * Clear all cursors
   */
  clearAll(): void {
    this.cursors.clear();
  }
}
