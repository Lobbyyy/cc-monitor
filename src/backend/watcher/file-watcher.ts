import { watch, type FSWatcher } from 'fs';
import { join } from 'path';
import { CursorManager } from './cursor-manager';
import { ModelTransitionDetector } from './model-detector';
import { SessionTracker } from './session-tracker';
import { parseJsonlEntry } from '../parsers/jsonl-parser';
import { insertRequest } from '../db/queries';
import { logger } from '../utils/logger';

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private cursorManager = new CursorManager();
  private modelDetector = new ModelTransitionDetector();
  private sessionTracker = new SessionTracker();
  private watchDir: string;

  constructor(watchDir: string) {
    this.watchDir = watchDir;
  }

  /**
   * Start watching the directory for JSONL file changes
   */
  async start(): Promise<void> {
    logger.info({ watchDir: this.watchDir }, 'Starting file watcher');

    // Process existing files first
    await this.processExistingFiles();

    // Watch for changes
    this.watcher = watch(
      this.watchDir,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename?.endsWith('.jsonl')) return;

        const fullPath = join(this.watchDir, filename);
        await this.handleFileChange(fullPath);
      }
    );
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('File watcher stopped');
    }
  }

  /**
   * Process existing files on startup
   */
  private async processExistingFiles(): Promise<void> {
    const { readdirSync, statSync, existsSync } = await import('fs');

    if (!existsSync(this.watchDir)) {
      return;
    }

    const files = readdirSync(this.watchDir, { recursive: true });

    for (const file of files) {
      const filename = file.toString();
      if (!filename.endsWith('.jsonl')) continue;

      const fullPath = join(this.watchDir, filename);
      const stats = statSync(fullPath);

      if (stats.isFile()) {
        await this.handleFileChange(fullPath);
      }
    }
  }

  /**
   * Handle a file change event
   */
  private async handleFileChange(filePath: string): Promise<void> {
    try {
      // Read only new content since last cursor
      const newContent = await this.cursorManager.readNewContent(filePath);
      const lines = newContent.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          await this.processEntry(entry, filePath);
        } catch (parseError) {
          console.error(`Failed to parse JSONL line: ${parseError}`);
        }
      }
    } catch (error) {
      console.error(`Error handling file ${filePath}:`, error);
    }
  }

  /**
   * Process a single JSONL entry
   */
  private async processEntry(entry: any, filePath: string): Promise<void> {
    const parsed = parseJsonlEntry(entry);
    if (!parsed) return;

    // Update session activity
    await this.sessionTracker.updateActivity({
      sessionId: parsed.session_id,
      projectPath: entry.cwd || '/unknown',
      modelConfig: 'auto', // TODO: Detect from session settings
      currentModel: parsed.model,
      hasSubagents: parsed.is_subagent,
    });

    // Detect model transitions BEFORE inserting request
    // (so we can compare against previous model)
    await this.modelDetector.detectTransition(
      parsed.session_id,
      parsed.model
    );

    // Insert request
    await insertRequest(parsed);

    logger.info({
      model: parsed.model,
      tokens: parsed.total_tokens,
      cost: parsed.estimated_cost_usd.toFixed(6),
    }, 'Processed request');
  }
}
