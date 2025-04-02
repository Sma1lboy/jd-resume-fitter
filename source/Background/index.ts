import { browser, Runtime } from 'webextension-polyfill-ts';
import { runResumeWorkflow } from '../utils/aiWorkflow';

const CONTEXT_MENU_ID = 'GENERATE_RESUME_SNIPPET';

browser.runtime.onInstalled.addListener((): void => {
  console.log('🦊', 'extension installed');

  // Create context menu item
  browser.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Generate Resume Snippet for Job Desc',
    contexts: ['selection'], // Only show when text is selected
  });

  console.log('Context menu created.');
});

// Listener for context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  // Added optional chaining for tab just in case
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    console.log('Context menu clicked.');
    console.log('Selected Text (Job Description):', info.selectionText);

    try {
      // Run the resume workflow
      const result = await runResumeWorkflow(info.selectionText);

      // Copy the result to clipboard
      // We need to send a message to the content script to do this
      if (tab?.id && result) {
        await browser.tabs.sendMessage(tab.id, {
          action: 'copyToClipboard',
          content: result,
        });

        // Notify the user
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
          title: 'Resume Generator',
          message: 'Resume snippet generated and copied to clipboard!',
        });
      }
    } catch (error) {
      console.error('Error in resume workflow:', error);

      // Notify the user of the error
      await browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Resume Generator - Error',
        message: 'Failed to generate resume snippet. Please try again.',
      });
    }
  }
});

// Message listener
browser.runtime.onMessage.addListener(
  (message: unknown, sender: Runtime.MessageSender) => {
    console.log('Message received in background:', message);

    // Handle messages if needed
    // Example: sendResponse({ status: 'Received' });
  }
);
