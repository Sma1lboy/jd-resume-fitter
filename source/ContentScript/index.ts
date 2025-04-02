import { browser } from 'webextension-polyfill-ts';

console.log('Resume Generator content script loaded');
console.log('Content script URL:', window.location.href);
console.log('Browser object available:', !!browser);

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
  document.body.appendChild(debugElement);
}
// Function to copy text to clipboard
function copyToClipboard(text: string): void {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Make the textarea out of viewport
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    // Copy the text
    const successful = document.execCommand('copy');

    // Remove the textarea
    document.body.removeChild(textarea);

    if (successful) {
      console.log('Text copied to clipboard successfully');
      showNotification('Resume copied to clipboard!');
    } else {
      console.error('Failed to copy text to clipboard');
      showNotification('Failed to copy resume to clipboard!');
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
  }
}

// Create a floating notification to show when text is copied
function showNotification(message: string): void {
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
  }

  // Create the toast element
  const toast = document.createElement('div');
  toast.className = message.includes('Failed')
    ? 'toast-error'
    : 'toast-success';
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
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, 3000);
}

// Function to show a loading toast with spinner
function showLoadingToast(id: string, message: string): void {
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
  }

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
}

// Function to hide a specific toast by ID
function hideLoadingToast(id: string): void {
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
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message: any) => {
  console.log('Message received in content script:', message);

  try {
    // Update debug element if it exists
    const debugIndicator = document.getElementById('resume-generator-debug');
    if (debugIndicator) {
      const timestamp = new Date().toLocaleTimeString();
      debugIndicator.textContent = `Last message: ${message.action} at ${timestamp}`;
    }

    // Handle copyToClipboard action
    if (message.action === 'copyToClipboard' && message.content) {
      console.log(
        'Copying to clipboard, content length:',
        message.content.length
      );
      copyToClipboard(message.content);
      return Promise.resolve({ success: true, action: 'copyToClipboard' });
    }

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

// Log that we've set up the message listener
console.log('Resume Generator message listener initialized');

export {};
