import { browser } from 'webextension-polyfill-ts';
import { createDebugConsole, addLogToDebugConsole } from '../utils/debugLogger';

console.log('Resume Generator content script loaded');
console.log('Content script URL:', window.location.href);
console.log('Browser object available:', !!browser);

// Create debug console if in debug mode or if debug=true is in URL
const isDebugMode = window.location.search.includes('debug=true');
if (isDebugMode && document.body) {
  createDebugConsole();
} else if (isDebugMode) {
  // If body isn't available yet, wait for it
  window.addEventListener('DOMContentLoaded', () => {
    createDebugConsole();
  });
}

// Track whether the content script is fully initialized
let isInitialized = false;

// Add a visible indicator that the content script is loaded (for debugging)
const debugElement = document.createElement('div');
debugElement.id = 'resume-generator-debug'; // Add ID for later reference
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
debugElement.style.display = 'none'; // Hidden by default, only show in debug mode

// Check if we're in debug mode (add ?debug=true to the URL)
if (window.location.search.includes('debug=true')) {
  debugElement.style.display = 'block';

  if (document.body) {
    document.body.appendChild(debugElement);
  } else {
    // If body isn't available yet, wait for it
    window.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(debugElement);
    });
  }
}

// Make sure styles are only added once
let stylesAdded = false;

// Function to ensure toast styles are added to the document
function ensureToastStyles() {
  if (stylesAdded) return;

  // Add Sonner styles
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
}

// Function to get or create the toast container
function getToastContainer(): HTMLElement {
  // Create a container for the toast if it doesn't exist
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

    // Ensure styles are added
    ensureToastStyles();
  }

  return toastContainer;
}

// Update debug status if in debug mode
function updateDebugStatus(status: string) {
  const debugIndicator = document.getElementById('resume-generator-debug');
  if (debugIndicator) {
    const timestamp = new Date().toLocaleTimeString();
    debugIndicator.textContent = `${status} at ${timestamp}`;
  }
}

// Create a floating notification to show when text is copied
function showNotification(
  message: string,
  type: 'success' | 'error' = 'success'
): void {
  try {
    const toastContainer = getToastContainer();

    // Create the toast element
    const toast = document.createElement('div');
    toast.className = type === 'error' ? 'toast-error' : 'toast-success';
    toast.textContent = message;

    // Add to container
    toastContainer.appendChild(toast);

    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }

        // Remove container if empty
        if (toastContainer.childNodes.length === 0) {
          try {
            if (document.body.contains(toastContainer)) {
              document.body.removeChild(toastContainer);
            }
          } catch (removeError) {
            console.warn('Error removing toast container:', removeError);
          }
        }
      }, 300);
    }, 3000);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Function to show a loading toast with spinner
function showLoadingToast(id: string, message: string): void {
  try {
    const toastContainer = getToastContainer();

    // Check if a toast with this ID already exists
    let toast = document.getElementById(id);

    if (!toast) {
      // Create the toast element
      toast = document.createElement('div');
      toast.id = id;
      toast.className = 'toast-loading';

      // Create spinner
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      toast.appendChild(spinner);

      // Add message
      const messageSpan = document.createElement('span');
      messageSpan.textContent = message;
      toast.appendChild(messageSpan);

      // Add to container
      toastContainer.appendChild(toast);
    }

    updateDebugStatus(`Loading toast shown: ${message}`);
  } catch (error) {
    console.error('Error showing loading toast:', error);
  }
}

// Function to update a loading toast with a new message
function updateLoadingToast(id: string, message: string): void {
  try {
    const toast = document.getElementById(id);
    if (toast) {
      // Find the message span (second child)
      const messageSpan = toast.querySelector('span');
      if (messageSpan) {
        messageSpan.textContent = message;
        updateDebugStatus(`Toast updated: ${message}`);
      }
    }
  } catch (error) {
    console.error('Error updating loading toast:', error);
  }
}

// Function to hide a specific toast by ID
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
        }

        // Remove container if empty
        if (toastContainer.childNodes.length === 0) {
          try {
            if (document.body.contains(toastContainer)) {
              document.body.removeChild(toastContainer);
            }
          } catch (removeError) {
            console.warn('Error removing toast container:', removeError);
          }
        }
      }, 300);

      updateDebugStatus(`Toast hidden: ${id}`);
    }
  } catch (error) {
    console.error('Error hiding loading toast:', error);
  }
}

// Listen for messages from the background script with improved error handling
browser.runtime.onMessage.addListener((message: any) => {
  // Handle debug logs
  if (message.action === 'debugLog') {
    console.log(`[DEBUG LOG] ${message.level}: ${message.message}`);

    // Add to debug console if it exists
    if (document.getElementById('resume-generator-debug-console')) {
      addLogToDebugConsole(message.message, message.level);
    }

    return Promise.resolve({ success: true, action: 'debugLog' });
  }
  console.log('Message received in content script:', message);
  updateDebugStatus(`Message received: ${message.action}`);

  try {
    // Handle showLoadingToast action
    if (
      message.action === 'showLoadingToast' &&
      message.id &&
      message.message
    ) {
      console.log('Showing loading toast:', message.id, message.message);
      showLoadingToast(message.id, message.message);
      return Promise.resolve({ success: true, action: 'showLoadingToast' });
    }

    // Handle hideLoadingToast action
    if (message.action === 'hideLoadingToast' && message.id) {
      console.log('Hiding loading toast:', message.id);
      hideLoadingToast(message.id);
      return Promise.resolve({ success: true, action: 'hideLoadingToast' });
    }

    // Handle updateLoadingToast action
    if (
      message.action === 'updateLoadingToast' &&
      message.id &&
      message.message
    ) {
      console.log('Updating loading toast:', message.id, message.message);
      updateLoadingToast(message.id, message.message);
      return Promise.resolve({ success: true, action: 'updateLoadingToast' });
    }

    console.warn('Unknown action received:', message.action);
    return Promise.resolve({
      success: false,
      error: 'Unknown action',
      receivedAction: message.action,
    });
  } catch (error) {
    console.error('Error handling message in content script:', error);
    return Promise.resolve({ success: false, error: String(error) });
  }
});

// Initialization function to ensure content script is ready
function initialize() {
  if (isInitialized) return;

  // Mark as initialized
  isInitialized = true;
  console.log('Resume Generator content script initialized');

  // Notify background script that content script is ready (optional)
  try {
    browser.runtime
      .sendMessage({ action: 'contentScriptReady' })
      .catch(error =>
        console.warn('Could not notify background script:', error)
      );
  } catch (error) {
    console.warn('Error notifying background script:', error);
  }
}

// Initialize if document is already loaded
if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  initialize();
} else {
  // Otherwise wait for DOMContentLoaded
  window.addEventListener('DOMContentLoaded', initialize);
}

// Also initialize after a short delay as a fallback
setTimeout(initialize, 1000);

// Log that we've set up the message listener
console.log('Resume Generator message listener initialized');

export {};
