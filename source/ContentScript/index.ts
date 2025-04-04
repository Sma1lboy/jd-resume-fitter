import { browser } from 'webextension-polyfill-ts';
import { createDebugConsole, addLogToDebugConsole, Logger, contentLogger } from '../utils/debugLogger';

// Check if debug mode is enabled
const isDebugMode = Logger.isContentScriptDebugMode();

contentLogger.info('Resume Generator content script loaded');
contentLogger.info('Content script URL:', window.location.href);
contentLogger.info('Browser object available:', !!browser);

// Create debug console if in debug mode
if (isDebugMode && document.body) {
  createDebugConsole();
  contentLogger.debug('Debug console created');
} else if (isDebugMode) {
  window.addEventListener('DOMContentLoaded', () => {
    createDebugConsole();
    contentLogger.debug('Debug console created (delayed)');
  });
}

let isInitialized = false;

/**
 * Creates a visual indicator showing the ContentScript is loaded
 */
const createDebugIndicator = () => {
  if (!isDebugMode) return;
  
  const debugElement = document.createElement('div');
  debugElement.id = 'resume-generator-debug';
  debugElement.style.position = 'fixed';
  debugElement.style.bottom = '5px';
  debugElement.style.left = '5px';
  debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  debugElement.style.color = 'white';
  debugElement.style.padding = '5px';
  debugElement.style.borderRadius = '3px';
  debugElement.style.fontSize = '10px';
  debugElement.style.zIndex = '9999';
  debugElement.textContent = 'Resume Generator loaded';
  
  document.body.appendChild(debugElement);
  contentLogger.debug('Debug indicator added to page');
};

if (isDebugMode) {
  if (document.body) {
    createDebugIndicator();
  } else {
    window.addEventListener('DOMContentLoaded', createDebugIndicator);
  }
}

let stylesAdded = false;

/**
 * Ensures toast notification styles are added to the document
 */
function ensureToastStyles() {
  if (stylesAdded) return;

  const style = document.createElement('style');
  style.textContent = `
    .toast-success {
      background-color: hsl(142.1, 76.2%, 36.3%);
      color: white;
      border-radius: 6px;
      padding: 12px 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      opacity: 0;
      transform: translateY(16px);
      animation: toast-in 0.3s ease forwards;
    }
    
    .toast-error {
      background-color: hsl(0, 84.2%, 60.2%);
      color: white;
      border-radius: 6px;
      padding: 12px 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      opacity: 0;
      transform: translateY(16px);
      animation: toast-in 0.3s ease forwards;
    }
    
    .toast-loading {
      background-color: hsl(215, 20.2%, 65.1%);
      color: white;
      border-radius: 6px;
      padding: 12px 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      opacity: 0;
      transform: translateY(16px);
      animation: toast-in 0.3s ease forwards;
    }
    
    .spinner {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes toast-in {
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  document.head.appendChild(style);
  stylesAdded = true;
  contentLogger.debug('Toast styles added to page');
}

/**
 * Gets or creates the toast container
 */
function getToastContainer(): HTMLElement {
  let toastContainer = document.getElementById(
    'resume-generator-toast-container'
  );

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'resume-generator-toast-container';
    toastContainer.className = 'toaster group';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);

    ensureToastStyles();
    contentLogger.debug('Toast container created');
  }

  return toastContainer;
}

/**
 * Updates debug status indicator
 */
function updateDebugStatus(status: string) {
  if (!isDebugMode) return;
  
  const debugIndicator = document.getElementById('resume-generator-debug');
  if (debugIndicator) {
    const timestamp = new Date().toLocaleTimeString();
    debugIndicator.textContent = `${status} at ${timestamp}`;
    contentLogger.debug(`Status updated: ${status}`);
  }
}

/**
 * Shows a notification toast
 */
function showNotification(
  message: string,
  type: 'success' | 'error' = 'success'
): void {
  try {
    const toastContainer = getToastContainer();

    const toast = document.createElement('div');
    toast.className = type === 'error' ? 'toast-error' : 'toast-success';
    toast.textContent = message;

    toastContainer.appendChild(toast);
    contentLogger.debug(`Notification shown: ${message} (${type})`);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
          contentLogger.debug('Notification removed');
        }

        if (toastContainer.childNodes.length === 0) {
          try {
            if (document.body.contains(toastContainer)) {
              document.body.removeChild(toastContainer);
              contentLogger.debug('Toast container removed');
            }
          } catch (removeError) {
            contentLogger.warn('Error removing toast container:', removeError);
          }
        }
      }, 300);
    }, 3000);
  } catch (error) {
    contentLogger.error('Error showing notification:', error);
  }
}

/**
 * Shows a loading toast with spinner
 */
function showLoadingToast(id: string, message: string): void {
  try {
    const toastContainer = getToastContainer();

    let toast = document.getElementById(id);

    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      toast.className = 'toast-loading';

      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      toast.appendChild(spinner);

      const messageSpan = document.createElement('span');
      messageSpan.textContent = message;
      toast.appendChild(messageSpan);

      toastContainer.appendChild(toast);
      contentLogger.debug(`Loading toast shown: ${id} - ${message}`);
    }

    updateDebugStatus(`Loading toast shown: ${message}`);
  } catch (error) {
    contentLogger.error('Error showing loading toast:', error);
  }
}

/**
 * Updates the message of a loading toast
 */
function updateLoadingToast(id: string, message: string): void {
  try {
    const toast = document.getElementById(id);
    if (toast) {
      const messageSpan = toast.querySelector('span');
      if (messageSpan) {
        messageSpan.textContent = message;
        contentLogger.debug(`Toast updated: ${id} - ${message}`);
      }
    }
  } catch (error) {
    contentLogger.error('Error updating loading toast:', error);
  }
}

/**
 * Hides a loading toast by ID
 */
function hideLoadingToast(id: string): void {
  try {
    const toast = document.getElementById(id);
    const toastContainer = document.getElementById(
      'resume-generator-toast-container'
    );

    if (toast && toastContainer) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
          contentLogger.debug(`Toast hidden and removed: ${id}`);
        }

        if (toastContainer.childNodes.length === 0) {
          try {
            if (document.body.contains(toastContainer)) {
              document.body.removeChild(toastContainer);
              contentLogger.debug('Toast container removed after hiding toast');
            }
          } catch (removeError) {
            contentLogger.warn('Error removing toast container:', removeError);
          }
        }
      }, 300);

      updateDebugStatus(`Toast hidden: ${id}`);
    }
  } catch (error) {
    contentLogger.error('Error hiding loading toast:', error);
  }
}

/**
 * Message listener for background script communication
 */
browser.runtime.onMessage.addListener((message: any) => {
  if (message.action === 'debugLog') {
    console.log(`[DEBUG LOG] ${message.level}: ${message.message}`);

    if (document.getElementById('resume-generator-debug-console')) {
      addLogToDebugConsole(message.message, message.level);
    }

    return Promise.resolve({ success: true, action: 'debugLog' });
  }
  
  contentLogger.debug('Message received:', message);
  updateDebugStatus(`Message received: ${message.action}`);

  try {
    if (
      message.action === 'showLoadingToast' &&
      message.id &&
      message.message
    ) {
      showLoadingToast(message.id, message.message);
      return Promise.resolve({ success: true, action: 'showLoadingToast' });
    }

    if (message.action === 'hideLoadingToast' && message.id) {
      hideLoadingToast(message.id);
      return Promise.resolve({ success: true, action: 'hideLoadingToast' });
    }

    if (
      message.action === 'updateLoadingToast' &&
      message.id &&
      message.message
    ) {
      updateLoadingToast(message.id, message.message);
      return Promise.resolve({ success: true, action: 'updateLoadingToast' });
    }

    contentLogger.warn('Unknown action received:', message.action);
    return Promise.resolve({
      success: false,
      error: 'Unknown action',
      receivedAction: message.action,
    });
  } catch (error) {
    contentLogger.error('Error handling message in content script:', error);
    return Promise.resolve({ success: false, error: String(error) });
  }
});

/**
 * Initializes the content script
 */
function initialize() {
  if (isInitialized) return;

  isInitialized = true;
  contentLogger.info('Resume Generator content script initialized');

  try {
    browser.runtime
      .sendMessage({ action: 'contentScriptReady' })
      .catch(error =>
        contentLogger.warn('Could not notify background script:', error)
      );
  } catch (error) {
    contentLogger.warn('Error notifying background script:', error);
  }
}

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  initialize();
} else {
  window.addEventListener('DOMContentLoaded', initialize);
}

setTimeout(initialize, 1000);

contentLogger.info('Resume Generator message listener initialized');

export {};
