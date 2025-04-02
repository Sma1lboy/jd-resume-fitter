import { browser } from 'webextension-polyfill-ts';

console.log('Resume Generator content script loaded');
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

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message: any) => {
  console.log('Message received in content script:', message);

  // Handle copyToClipboard action
  if (message.action === 'copyToClipboard' && message.content) {
    copyToClipboard(message.content);
    return Promise.resolve({ success: true });
  }

  return Promise.resolve({ success: false, error: 'Unknown action' });
});

export {};
