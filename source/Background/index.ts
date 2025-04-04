import { browser, Notifications, Runtime } from 'webextension-polyfill-ts';
import { runResumeWorkflow } from '../utils/aiWorkflow';
import { debugLogger } from '../utils/debugLogger';

const CONTEXT_MENU_ID = 'GENERATE_RESUME_SNIPPET';
let isWorkflowRunning = false;

// Function to create the context menu
async function createContextMenu() {
  try {
    // First remove any existing context menus to avoid duplicates
    await browser.contextMenus.removeAll();
    debugLogger.info('Removed existing context menus');

    // Create context menu item
    browser.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Generate Resume Snippet for Job Desc',
      contexts: ['selection'], // Only show when text is selected
    });

    debugLogger.info('Context menu created successfully.');
  } catch (error) {
    debugLogger.error('Error creating context menu: ' + String(error));
  }
}

// Create context menu when extension is installed
browser.runtime.onInstalled.addListener((): void => {
  debugLogger.info('🦊 Extension installed');
  createContextMenu();
});

// Also create the context menu when the service worker starts
// This ensures it's available even if the onInstalled event doesn't fire
createContextMenu();

// Helper function to send messages to content script with error handling
async function sendTabMessage(tabId: number, message: any): Promise<any> {
  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    debugLogger.error('Error sending message to tab: ' + String(error));
    // If the content script isn't loaded yet, we might need to inject it
    try {
      await browser.tabs.executeScript(tabId, {
        file: '../contentScript.js',
      });
      // Try sending the message again after injecting the script
      return await browser.tabs.sendMessage(tabId, message);
    } catch (injectError) {
      debugLogger.error(
        'Failed to inject content script: ' + String(injectError)
      );
      throw error;
    }
  }
}

// Function to create and show a notification with retry
async function showNotification(
  options: Notifications.CreateNotificationOptions,
  maxRetries = 3
): Promise<string> {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      return await browser.notifications.create(options);
    } catch (error) {
      debugLogger.error(
        `Notification error (attempt ${retries + 1}/${maxRetries + 1}): ` +
          String(error)
      );
      // eslint-disable-next-line no-plusplus
      retries++;

      if (retries <= maxRetries) {
        await new Promise(resolve => {
          setTimeout(resolve, 500);
        });
      } else {
        debugLogger.error('Maximum retry attempts reached for notification.');
        throw error;
      }
    }
  }

  throw new Error('Failed to show notification after retries');
}

// Listener for context menu clicks with debouncing
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  debugLogger.info('Context menu clicked with ID: ' + info.menuItemId);

  // Exit early if workflow is already running or if menu item doesn't match
  if (
    isWorkflowRunning ||
    info.menuItemId !== CONTEXT_MENU_ID ||
    !info.selectionText ||
    !tab?.id
  ) {
    debugLogger.info(
      isWorkflowRunning
        ? 'Ignoring click - workflow already running'
        : 'Ignoring click - conditions not met'
    );
    return;
  }

  // Set the flag to prevent multiple workflows
  isWorkflowRunning = true;

  debugLogger.info('Starting resume generation workflow...');
  debugLogger.info(
    'Selected Text (Job Description): ' +
      (info.selectionText
        ? info.selectionText.substring(0, 100) + '...'
        : 'No text selected')
  );

  // Keep track of the loading notification ID
  const loadingNotificationId = 'resume-generator-loading';

  try {
    // Show loading notification in the content script
    await sendTabMessage(tab.id, {
      action: 'showLoadingToast',
      id: loadingNotificationId,
      message: 'Generating resume snippet...',
    });

    // Create our progress reporting function
    const updateProgress = async (phase: string, percentage: number) => {
      debugLogger.info(`Progress update: ${phase} ${percentage}%`);
      await sendTabMessage(tab.id, {
        action: 'updateLoadingToast',
        id: loadingNotificationId,
        message: `${phase} (${percentage}%)...`,
      });
    };

    // Run the resume workflow with comprehensive progress updates and error handling
    const result = await runResumeWorkflow(info.selectionText, {
      onAnalysisStart: async () => {
        debugLogger.info('Analysis started callback triggered');
        await updateProgress('Analyzing job description', 25);
      },
      onAnalysisComplete: async () => {
        debugLogger.info('Analysis completed callback triggered');
        await updateProgress('Analysis complete', 50);
      },
      onGenerationStart: async () => {
        debugLogger.info('Generation started callback triggered');
        await updateProgress('Generating resume', 60);
      },
      onGenerationComplete: async () => {
        debugLogger.info('Generation completed callback triggered');
        await updateProgress('Resume generated', 90);
      },
      onProgress: updateProgress,
      onError: async error => {
        debugLogger.error(
          'Workflow error caught in callback: ' + String(error)
        );
        await sendTabMessage(tab.id, {
          action: 'hideLoadingToast',
          id: loadingNotificationId,
        });

        // Show error notification
        await showNotification({
          type: 'basic',
          iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
          title: 'Resume Generator - Error',
          message: `Error: ${error.message || 'Unknown error'}`,
        });
      },
    });

    // Hide loading notification
    await sendTabMessage(tab.id, {
      action: 'hideLoadingToast',
      id: loadingNotificationId,
    });

    if (result) {
      // Save the resume to storage for later access
      try {
        // Get existing resume list
        const storageData =
          await browser.storage.local.get('recentlyResumeList');
        const recentlyResumeList = storageData.recentlyResumeList || [];

        // Add new resume to the list (limit to 10 items)
        const newResume = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          content: result,
          preview: result.substring(0, 100) + '...',
          jobDescription: info.selectionText.substring(0, 100) + '...',
        };

        // Add to beginning of array and limit to 10 items
        recentlyResumeList.unshift(newResume);
        if (recentlyResumeList.length > 10) {
          recentlyResumeList.pop();
        }

        // Save back to storage
        await browser.storage.local.set({ recentlyResumeList });
        debugLogger.info('Resume saved to storage for later access');
      } catch (storageError) {
        debugLogger.error(
          'Error saving resume to storage: ' + String(storageError)
        );
      }

      // Show success notification
      await showNotification({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Resume Generator',
        message: 'Resume snippet generated and copied to clipboard!',
      });

      debugLogger.info('Resume workflow completed successfully');
    } else {
      // Show error notification if no result but no exception
      await showNotification({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Resume Generator - Error',
        message: 'Failed to generate resume snippet. Please try again.',
      });

      debugLogger.info('Resume workflow completed with no result');
    }
  } catch (error) {
    debugLogger.error('Uncaught error in resume workflow: ' + String(error));

    // Make sure to hide the loading toast if there's an uncaught error
    try {
      await sendTabMessage(tab.id, {
        action: 'hideLoadingToast',
        id: loadingNotificationId,
      });
    } catch (toastError) {
      debugLogger.error(
        'Error hiding loading toast after error: ' + String(toastError)
      );
    }

    // Show error notification
    try {
      await showNotification({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Resume Generator - Error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } catch (notificationError) {
      debugLogger.error(
        'Failed to show error notification: ' + String(notificationError)
      );
    }
  } finally {
    // Always reset the workflow flag when done
    isWorkflowRunning = false;
    debugLogger.info('Resume workflow complete, ready for next request');
  }
});

// Message listener with improved error handling
browser.runtime.onMessage.addListener(
  (message: unknown, sender: Runtime.MessageSender) => {
    debugLogger.info(
      'Message received in background: ' + JSON.stringify(message)
    );
    debugLogger.info('Message sender: ' + JSON.stringify(sender));

    // Handle messages if needed
    return Promise.resolve({ status: 'Received' });
  }
);
