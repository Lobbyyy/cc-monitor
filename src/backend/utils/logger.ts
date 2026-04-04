import pino from 'pino';

/**
 * Log levels for the application
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structured logger using Pino
 * Provides high-performance logging with structured data support
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
});
