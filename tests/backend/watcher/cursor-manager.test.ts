import { describe, it, expect, beforeEach } from 'vitest';
import { CursorManager } from '../../../src/backend/watcher/cursor-manager';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('CursorManager', () => {
  const testDir = join(__dirname, '../../tmp');
  const testFile = join(testDir, 'test.jsonl');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  it('should return 0 for new files', () => {
    const manager = new CursorManager();
    expect(manager.getCursor(testFile)).toBe(0);
  });

  it('should update cursor position', () => {
    const manager = new CursorManager();
    manager.updateCursor(testFile, 100);
    expect(manager.getCursor(testFile)).toBe(100);
  });

  it('should read only new content from cursor position', async () => {
    // Write initial content
    writeFileSync(testFile, 'line 1\nline 2\n');

    const manager = new CursorManager();
    const content1 = await manager.readNewContent(testFile);
    expect(content1).toBe('line 1\nline 2\n');

    // Append more content
    writeFileSync(testFile, 'line 1\nline 2\nline 3\nline 4\n');

    const content2 = await manager.readNewContent(testFile);
    expect(content2).toBe('line 3\nline 4\n');
  });

  it('should handle empty files', async () => {
    writeFileSync(testFile, '');
    const manager = new CursorManager();
    const content = await manager.readNewContent(testFile);
    expect(content).toBe('');
  });
});
