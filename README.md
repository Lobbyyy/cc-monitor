# Claude Code Usage Monitor

Local monitoring tool for tracking Claude Code usage across terminals.

## Setup

```bash
bun install
bun run db:migrate
```

## Development

```bash
bun test           # Run tests
bun test:watch     # Watch mode
```

## Architecture

- **Backend**: Bun + Drizzle ORM + SQLite
- **Parser**: Reads ~/.claude/projects/**/*.jsonl files
- **Storage**: ~/.claude-usage-monitor/database.db
