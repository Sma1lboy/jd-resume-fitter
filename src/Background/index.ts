import { browser, Notifications, Runtime } from 'webextension-polyfill-ts';
import { generateTailoredResumeSimple } from '@/utils/aiSimpleWorkflow';
import { getOpenAISettings, getResumeTemplate, getUserProfile } from '@/utils/config';

const CONTEXT_MENU_ID = 'GENERATE_RESUME_SNIPPET';
let isWorkflowRunning = false;

// Function to create the context menu
async function createContextMenu() {
  try {
    // First remove any existing context menus to avoid duplicates
    await browser.contextMenus.removeAll();
    console.info('Removed existing context menus');

    // Create context menu item
    browser.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Generate Resume Snippet for Job Desc',
      contexts: ['selection'], // Only show when text is selected
    });

    console.info('Context menu created successfully.');
  } catch (error) {
    console.error('Error creating context menu: ' + String(error));
  }
}

// Create context menu when extension is installed
browser.runtime.onInstalled.addListener((): void => {
  console.info('Extension installed');
  createContextMenu();
});

// Also create the context menu when the service worker starts
createContextMenu();

// Helper function to send messages to content script
async function sendTabMessage(tabId: number, message: any): Promise<any> {
  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.error('Error sending message to tab: ' + String(error));
    throw error;
  }
}

// Function to create and show a notification
async function showNotification(
  options: Notifications.CreateNotificationOptions
): Promise<string> {
  try {
    return await browser.notifications.create(options);
  } catch (error) {
    console.error('Notification error: ' + String(error));
    throw error;
  }
}

// Listener for context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  console.info('Context menu clicked with ID: ' + info.menuItemId);

  // Exit early if workflow is already running or if menu item doesn't match
  if (
    isWorkflowRunning ||
    info.menuItemId !== CONTEXT_MENU_ID ||
    !info.selectionText ||
    !tab?.id
  ) {
    console.info(
      isWorkflowRunning
        ? 'Ignoring click - workflow already running'
        : 'Ignoring click - conditions not met'
    );
    return;
  }

  // Set the flag to prevent multiple workflows
  isWorkflowRunning = true;

  // Keep track of the loading notification ID
  const loadingNotificationId = 'resume-generator-loading';

  try {
    // Show loading notification in the content script
    await sendTabMessage(tab.id, {
      action: 'showLoadingToast',
      id: loadingNotificationId,
      message: 'Generating resume...',
    });

    // Get user profile and other necessary data
    const userProfile = await getUserProfile();
    if (!userProfile) {
      throw new Error('User profile not found. Please set up your profile first.');
    }

    const template = await getResumeTemplate();
    if (!template) {
      throw new Error('Resume template not found. Please set up a template first.');
    }

    const settings = await getOpenAISettings();
    if (!settings.apiKey) {
      throw new Error('OpenAI API key not found. Please set up your API key first.');
    }

    // Update progress notification
    await sendTabMessage(tab.id, {
      action: 'updateLoadingToast',
      id: loadingNotificationId,
      message: 'Creating tailored resume...',
    });

    // Generate resume
    const result = await generateTailoredResumeSimple(
      info.selectionText,
      userProfile,
      template,
      settings
    );

    // Hide loading notification
    await sendTabMessage(tab.id, {
      action: 'hideLoadingToast',
      id: loadingNotificationId,
    });

    if (result) {
      // Save the resume to storage for later access
      try {
        // Get existing resume list
        const storageData = await browser.storage.local.get('recentlyResumeList');
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
      } catch (storageError) {
        console.error('Error saving resume to storage: ' + String(storageError));
      }

      // Show success notification
      await showNotification({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Resume Generator',
        message: 'Resume snippet generated and copied to clipboard!',
      });
    } else {
      // Show error notification if no result but no exception
      await showNotification({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Resume Generator - Error',
        message: 'Failed to generate resume snippet. Please try again.',
      });
    }
  } catch (error) {
    // Make sure to hide the loading toast if there's an uncaught error
    try {
      await sendTabMessage(tab.id, {
        action: 'hideLoadingToast',
        id: loadingNotificationId,
      });
    } catch (toastError) {
      console.error('Error hiding loading toast after error: ' + String(toastError));
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
      console.error('Failed to show error notification: ' + String(notificationError));
    }
  } finally {
    // Always reset the workflow flag when done
    isWorkflowRunning = false;
  }
});

// Message listener
browser.runtime.onMessage.addListener(
  (message: unknown, sender: Runtime.MessageSender) => {
    if (message && typeof message === 'object' && 'action' in message) {
      if (message.action === 'contentScriptReady') {
        console.debug('Content script ready notification received');
        return Promise.resolve({ success: true });
      }
    }
    
    // Default response
    return Promise.resolve({ success: false });
  }
);
