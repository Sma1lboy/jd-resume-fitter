import { browser } from 'webextension-polyfill-ts';
import { getSettings } from './settings';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;
}

// Cache debug mode status to avoid frequent async checks
let cachedDebugMode = false;
let lastCheckTime = 0;
const CACHE_TTL = 5000; // Cache time-to-live: 5 seconds

// Initialize debug mode cache
initDebugModeCache();

// Initialize cache
async function initDebugModeCache() {
  try {
    const settings = await getSettings();
    cachedDebugMode = settings.debugMode;
    lastCheckTime = Date.now();
    console.log(`[Logger] Debug mode initialized: ${cachedDebugMode}`);
  } catch (error) {
    console.error('[Logger] Failed to initialize debug mode cache:', error);
  }
}

// Update cache when storage changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.debugMode !== undefined) {
    cachedDebugMode = changes.debugMode.newValue;
    lastCheckTime = Date.now();
    console.log(`[Logger] Debug mode updated: ${cachedDebugMode}`);
  }
});

/**
 * Get debug mode status synchronously (using cache)
 */
function getDebugModeSync(): boolean {
  // If cache is expired, update in background but still return cached value for performance
  if (Date.now() - lastCheckTime > CACHE_TTL) {
    // Start async update, but don't wait for result
    initDebugModeCache().catch(() => {});
  }
  return cachedDebugMode;
}

/**
 * Create debug console UI
 */
export function createDebugConsole(): HTMLElement {
  // Check if console already exists
  let debugConsole = document.getElementById('resume-generator-debug-console');
  
  if (!debugConsole) {
    debugConsole = document.createElement('div');
    debugConsole.id = 'resume-generator-debug-console';
    debugConsole.style.position = 'fixed';
    debugConsole.style.bottom = '10px';
    debugConsole.style.right = '10px';
    debugConsole.style.width = '400px';
    debugConsole.style.height = '300px';
    debugConsole.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    debugConsole.style.color = 'white';
    debugConsole.style.padding = '10px';
    debugConsole.style.borderRadius = '5px';
    debugConsole.style.fontFamily = 'monospace';
    debugConsole.style.fontSize = '12px';
    debugConsole.style.overflowY = 'auto';
    debugConsole.style.zIndex = '10000';
    
    // Add title and close button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '10px';
    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
    header.style.paddingBottom = '5px';
    
    const title = document.createElement('div');
    title.textContent = 'Resume Generator Debug Console';
    title.style.fontWeight = 'bold';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      if (debugConsole && document.body.contains(debugConsole)) {
        document.body.removeChild(debugConsole);
      }
    };
    
    header.appendChild(title);
    header.appendChild(closeButton);
    debugConsole.appendChild(header);
    
    // Add log container
    const logContainer = document.createElement('div');
    logContainer.id = 'resume-generator-debug-logs';
    logContainer.style.height = 'calc(100% - 30px)';
    logContainer.style.overflowY = 'auto';
    debugConsole.appendChild(logContainer);
    
    // Add to body
    document.body.appendChild(debugConsole);
  }
  
  return debugConsole;
}

/**
 * Add log to debug console
 */
export function addLogToDebugConsole(message: string, level: LogLevel = 'info', source = 'App'): void {
  const debugLogs = document.getElementById('resume-generator-debug-logs');
  if (!debugLogs) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  
  // Set different colors for different log levels
  let color;
  switch (level) {
    case 'debug':
      color = '#87CEFA'; // Light blue
      break;
    case 'info':
      color = '#FFFFFF'; // White
      break;
    case 'warn':
      color = '#FFD700'; // Gold
      break;
    case 'error':
      color = '#FF6347'; // Tomato
      break;
    default:
      color = '#FFFFFF';
  }
  
  logEntry.style.color = color;
  logEntry.style.marginBottom = '3px';
  logEntry.textContent = `[${timestamp}] [${source}] [${level.toUpperCase()}] ${message}`;
  
  debugLogs.appendChild(logEntry);
  
  // Scroll to bottom
  debugLogs.scrollTop = debugLogs.scrollHeight;
}

/**
 * General purpose logger
 */
export class Logger {
  private namespace: string;
  
  constructor(namespace: string) {
    this.namespace = namespace;
  }
  
  /**
   * Format message
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
   * Send log to ContentScript (synchronous method)
   */
  private sendToContentScriptSync(level: LogLevel, message: string): void {
    if (getDebugModeSync()) {
      try {
        // Trigger async send but don't wait
        this.sendToContentScriptAsync(level, message);
      } catch (error) {
        // Ignore errors, ContentScript might not be loaded
      }
    }
  }
  
  /**
   * Send log to ContentScript asynchronously
   */
  private async sendToContentScriptAsync(level: LogLevel, message: string): Promise<void> {
    try {
      // Get current active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0 && tabs[0].id) {
        await browser.tabs.sendMessage(tabs[0].id, {
          action: 'debugLog',
          level,
          message: `[${this.namespace}] ${message}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      // Ignore errors, ContentScript might not be loaded
    }
  }
  
  /**
   * Output debug level log (synchronous method)
   */
  debug(...args: any[]): void {
    if (getDebugModeSync()) {
      const message = this.formatMessage(args);
      console.debug(`[${this.namespace}]`, ...args);
      this.sendToContentScriptSync('debug', message);
    }
  }
  
  /**
   * Output info level log (synchronous method)
   */
  info(...args: any[]): void {
    if (getDebugModeSync()) {
      const message = this.formatMessage(args);
      console.info(`[${this.namespace}]`, ...args);
      this.sendToContentScriptSync('info', message);
    }
  }
  
  /**
   * Output warn level log (synchronous method)
   */
  warn(...args: any[]): void {
    // Warnings are always displayed, regardless of debug mode
    const message = this.formatMessage(args);
    console.warn(`[${this.namespace}]`, ...args);
    this.sendToContentScriptSync('warn', message);
  }
  
  /**
   * Output error level log (synchronous method)
   */
  error(...args: any[]): void {
    // Errors are always displayed, regardless of debug mode
    const message = this.formatMessage(args);
    console.error(`[${this.namespace}]`, ...args);
    this.sendToContentScriptSync('error', message);
  }
  
  /**
   * Asynchronous version - Use only in special cases
   */
  async debugAsync(...args: any[]): Promise<void> {
    const settings = await getSettings();
    if (settings.debugMode) {
      const message = this.formatMessage(args);
      console.debug(`[${this.namespace}]`, ...args);
      await this.sendToContentScriptAsync('debug', message);
    }
  }
  
  /**
   * Asynchronous version - Use only in special cases
   */
  async infoAsync(...args: any[]): Promise<void> {
    const settings = await getSettings();
    if (settings.debugMode) {
      const message = this.formatMessage(args);
      console.info(`[${this.namespace}]`, ...args);
      await this.sendToContentScriptAsync('info', message);
    }
  }
  
  /**
   * Asynchronous version - Use only in special cases
   */
  async warnAsync(...args: any[]): Promise<void> {
    const message = this.formatMessage(args);
    console.warn(`[${this.namespace}]`, ...args);
    await this.sendToContentScriptAsync('warn', message);
  }
  
  /**
   * Asynchronous version - Use only in special cases
   */
  async errorAsync(...args: any[]): Promise<void> {
    const message = this.formatMessage(args);
    console.error(`[${this.namespace}]`, ...args);
    await this.sendToContentScriptAsync('error', message);
  }
  
  /**
   * Synchronous check to determine if in debug mode
   * Used in ContentScript because cannot use asynchronous functions
   */
  static isContentScriptDebugMode(): boolean {
    // URL parameter has highest priority
    if (window.location.search.includes('debug=true')) {
      return true;
    }
    // Next use cached settings
    return getDebugModeSync();
  }
}

// Create commonly used logger instances
export const contentLogger = new Logger('App');
export const aiLogger = new Logger('AI');
