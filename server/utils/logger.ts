/**
 * Bexly Server — Logger
 * Structured console logger for development and production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMessage(level: LogLevel, message: any, ...args: any[]): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === 'error') {
    console.error(prefix, message, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, message, ...args);
  } else if (level === 'debug') {
    if (process.env.NODE_ENV === 'development') {
      console.debug(prefix, message, ...args);
    }
  } else {
    console.log(prefix, message, ...args);
  }
}

export const logger = {
  info: (message: any, ...args: any[]) => formatMessage('info', message, ...args),
  warn: (message: any, ...args: any[]) => formatMessage('warn', message, ...args),
  error: (message: any, ...args: any[]) => formatMessage('error', message, ...args),
  debug: (message: any, ...args: any[]) => formatMessage('debug', message, ...args),
};
