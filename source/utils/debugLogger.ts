import { browser } from 'webextension-polyfill-ts';

// Store logs in memory in case we need to retrieve them later
const logBuffer: string[] = [];
const MAX_BUFFER_SIZE = 1000; // Maximum number of log entries to keep in memory

// Create a debug console element ID
const DEBUG_CONSOLE_ID = 'resume-generator-debug-console';

/**
 * Send a log message to all active content scripts
 * @param message The log message to send
 * @param level The log level (info, warn, error, debug)
 */
async function sendLogToContentScripts(
  message: string,
  level: 'info' | 'warn' | 'error' | 'debug' = 'info'
): Promise<void> {
  try {
    // Add timestamp to message
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Add to buffer
    logBuffer.push(formattedMessage);
    if (logBuffer.length > MAX_BUFFER_SIZE) {
      logBuffer.shift(); // Remove oldest log if buffer is full
    }

    // Get all tabs
    const tabs = await browser.tabs.query({});

    // Send message to all tabs
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await browser.tabs
            .sendMessage(tab.id, {
              action: 'debugLog',
              level,
              message: formattedMessage,
            })
            .catch(() => {
              // Ignore errors for tabs that don't have the content script running
            });
        } catch (error) {
          // Ignore errors for individual tabs
        }
      }
    }
  } catch (error) {
    // If we can't send to content scripts, at least log to background console
    console.error('Error sending log to content scripts:', error);
  }
}

/**
 * Create a debug logger that sends logs to content scripts
 */
export const debugLogger = {
  /**
   * Log an informational message
   * @param message The message to log
   */
  info: (message: string): void => {
    console.info(message); // Also log to background console
    sendLogToContentScripts(message, 'info');
  },

  /**
   * Log a warning message
   * @param message The message to log
   */
  warn: (message: string): void => {
    console.warn(message); // Also log to background console
    sendLogToContentScripts(message, 'warn');
  },

  /**
   * Log an error message
   * @param message The message to log
   */
  error: (message: string): void => {
    console.error(message); // Also log to background console
    sendLogToContentScripts(message, 'error');
  },

  /**
   * Log a debug message
   * @param message The message to log
   */
  debug: (message: string): void => {
    console.debug(message); // Also log to background console
    sendLogToContentScripts(message, 'debug');
  },

  /**
   * Get all logs from the buffer
   * @returns Array of log messages
   */
  getLogs: (): string[] => {
    return [...logBuffer];
  },

  /**
   * Clear the log buffer
   */
  clearLogs: (): void => {
    logBuffer.length = 0;
  },
};

/**
 * Create a debug console element in the content script
 * This should be called from the content script
 */
export function createDebugConsole(): void {
  // Check if debug console already exists
  if (document.getElementById(DEBUG_CONSOLE_ID)) {
    return;
  }

  // Create console container
  const consoleContainer = document.createElement('div');
  consoleContainer.id = DEBUG_CONSOLE_ID;
  consoleContainer.style.position = 'fixed';
  consoleContainer.style.bottom = '10px';
  consoleContainer.style.left = '10px';
  consoleContainer.style.width = '80%';
  consoleContainer.style.maxWidth = '600px';
  consoleContainer.style.height = '200px';
  consoleContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  consoleContainer.style.color = '#fff';
  consoleContainer.style.fontFamily = 'monospace';
  consoleContainer.style.fontSize = '12px';
  consoleContainer.style.padding = '10px';
  consoleContainer.style.borderRadius = '5px';
  consoleContainer.style.zIndex = '9999999';
  consoleContainer.style.overflow = 'auto';
  consoleContainer.style.display = 'flex';
  consoleContainer.style.flexDirection = 'column';

  // Add header with controls
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '5px';
  header.style.borderBottom = '1px solid #444';
  header.style.paddingBottom = '5px';

  // Title
  const title = document.createElement('div');
  title.textContent = 'Resume Generator Debug Console';
  title.style.fontWeight = 'bold';
  header.appendChild(title);

  // Controls
  const controls = document.createElement('div');

  // Clear button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.style.marginRight = '5px';
  clearButton.style.padding = '2px 5px';
  clearButton.style.backgroundColor = '#333';
  clearButton.style.color = '#fff';
  clearButton.style.border = 'none';
  clearButton.style.borderRadius = '3px';
  clearButton.style.cursor = 'pointer';
  clearButton.onclick = () => {
    const logContent = document.getElementById(`${DEBUG_CONSOLE_ID}-content`);
    if (logContent) {
      logContent.innerHTML = '';
    }
  };
  controls.appendChild(clearButton);

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.padding = '2px 5px';
  closeButton.style.backgroundColor = '#333';
  closeButton.style.color = '#fff';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '3px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    const console = document.getElementById(DEBUG_CONSOLE_ID);
    if (console && console.parentNode) {
      console.parentNode.removeChild(console);
    }
  };
  controls.appendChild(closeButton);

  header.appendChild(controls);
  consoleContainer.appendChild(header);

  // Log content area
  const logContent = document.createElement('div');
  logContent.id = `${DEBUG_CONSOLE_ID}-content`;
  logContent.style.flex = '1';
  logContent.style.overflow = 'auto';
  logContent.style.paddingTop = '5px';
  consoleContainer.appendChild(logContent);

  // Add to document
  document.body.appendChild(consoleContainer);
}

/**
 * Add a log message to the debug console
 * This should be called from the content script
 */
export function addLogToDebugConsole(message: string, level: string): void {
  const logContent = document.getElementById(`${DEBUG_CONSOLE_ID}-content`);
  if (!logContent) return;

  // Create log entry
  const logEntry = document.createElement('div');
  logEntry.style.marginBottom = '2px';
  logEntry.style.wordBreak = 'break-word';

  // Set color based on level
  switch (level.toLowerCase()) {
    case 'error':
      logEntry.style.color = '#ff5555';
      break;
    case 'warn':
      logEntry.style.color = '#ffaa00';
      break;
    case 'debug':
      logEntry.style.color = '#55aaff';
      break;
    case 'info':
    default:
      logEntry.style.color = '#ffffff';
      break;
  }

  logEntry.textContent = message;
  logContent.appendChild(logEntry);

  // Auto-scroll to bottom
  logContent.scrollTop = logContent.scrollHeight;
}
