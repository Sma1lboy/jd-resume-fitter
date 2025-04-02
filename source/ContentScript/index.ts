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
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 20px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  document.body.appendChild(notification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    document.body.removeChild(notification);
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
