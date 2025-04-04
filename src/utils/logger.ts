import { browser } from 'webextension-polyfill-ts';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Simple logger implementation for direct console output
 */
export class Logger {
  private namespace: string;
  
  constructor(namespace: string) {
    this.namespace = namespace;
  }
  
  /**
   * Format message for consistent output
   */
  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }
  
  /**
   * Output debug level log
   */
  debug(...args: any[]): void {
    console.debug(`[${this.namespace}]`, ...args);
  }
  
  /**
   * Output info level log
   */
  info(...args: any[]): void {
    console.info(`[${this.namespace}]`, ...args);
  }
  
  /**
   * Output warn level log
   */
  warn(...args: any[]): void {
    console.warn(`[${this.namespace}]`, ...args);
  }
  
  /**
   * Output error level log
   */
  error(...args: any[]): void {
    console.error(`[${this.namespace}]`, ...args);
  }
}

// Create global logger instance
export const logger = new Logger('App');
