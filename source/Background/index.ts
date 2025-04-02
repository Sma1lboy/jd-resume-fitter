import { browser, Runtime } from 'webextension-polyfill-ts';
import { runResumeWorkflow } from '../utils/aiWorkflow';

const CONTEXT_MENU_ID = 'GENERATE_RESUME_SNIPPET';

// Function to create the context menu
async function createContextMenu() {
  try {
    // First remove any existing context menus to avoid duplicates
    await browser.contextMenus.removeAll();
    console.log('Removed existing context menus');

    // Create context menu item
    browser.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Generate Resume Snippet for Job Desc',
      contexts: ['selection'], // Only show when text is selected
    });

    console.log('Context menu created successfully.');
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
}

// Create context menu when extension is installed
browser.runtime.onInstalled.addListener((): void => {
  console.log('🦊', 'extension installed');
  createContextMenu();
});

// Also create the context menu when the service worker starts
// This ensures it's available even if the onInstalled event doesn't fire
createContextMenu();

// Listener for context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked with ID:', info.menuItemId);
  console.log('Full info object:', info);
  console.log('Tab:', tab);

  // Added optional chaining for tab just in case
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    console.log('Context menu matched our ID and has selected text.');
    console.log('Selected Text (Job Description):', info.selectionText);

    try {
      console.log('Starting resume generation workflow...');
      // Show loading notification
      const loadingNotificationId = 'resume-generator-loading';
      if (tab?.id) {
        await browser.tabs.sendMessage(tab.id, {
          action: 'showLoadingToast',
          id: loadingNotificationId,
          message: 'Generating resume snippet...',
        });
      }

      // Send progress updates
      const updateProgress = async (stage: string, progress: number) => {
        if (tab?.id) {
          await browser.tabs.sendMessage(tab.id, {
            action: 'updateLoadingToast',
            id: loadingNotificationId,
            message: `${stage} (${progress}%)...`,
          });
        }
      };

      // Run the resume workflow with progress updates
      updateProgress('Analyzing job description', 10);

      // Add a timeout to ensure we don't get stuck
      const timeoutPromise = new Promise<null>(resolve => {
        setTimeout(() => {
          console.error('Resume workflow timed out after 2 minutes');
          resolve(null);
        }, 120000); // 2 minutes timeout
      });

      // Race between the workflow and the timeout
      let result;
      try {
        console.log('Starting resume workflow with callbacks...');
        result = await Promise.race([
          runResumeWorkflow(info.selectionText, {
            onAnalysisStart: () => {
              console.log('Analysis started callback triggered');
              return updateProgress('Analyzing job description', 25);
            },
            onAnalysisComplete: () => {
              console.log('Analysis completed callback triggered');
              return updateProgress('Generating resume', 50);
            },
            onGenerationStart: () => {
              console.log('Generation started callback triggered');
              return updateProgress('Generating resume', 75);
            },
            onGenerationComplete: () => {
              console.log('Generation completed callback triggered');
              return updateProgress('Finalizing resume', 90);
            },
          }),
          timeoutPromise,
        ]);
        console.log(
          'Resume workflow completed:',
          result ? 'Result received' : 'No result'
        );
      } catch (workflowError) {
        console.error('Error in resume workflow race:', workflowError);
        // Show error notification
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
          title: 'Resume Generator - Error',
          message: `Error: ${workflowError instanceof Error ? workflowError.message : 'Unknown error'}`,
        });
        result = null;
      }

      // Hide loading notification
      if (tab?.id) {
        await browser.tabs.sendMessage(tab.id, {
          action: 'hideLoadingToast',
          id: loadingNotificationId,
        });
      }

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
      } else if (tab?.id) {
        // If we have a tab but no result, show an error
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
          title: 'Resume Generator - Error',
          message: 'Failed to generate resume snippet. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error in resume workflow:', error);

      // Hide loading notification if there was an error
      if (tab?.id) {
        await browser.tabs.sendMessage(tab.id, {
          action: 'hideLoadingToast',
          id: 'resume-generator-loading',
        });
      }

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
