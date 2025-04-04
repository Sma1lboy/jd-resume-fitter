import { browser } from 'webextension-polyfill-ts';
import { logger } from './utils/logger';
import { setAppConfig } from './utils/config';

// Handle installation and updates
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    logger.info('Extension installed');
    
    // Initialize default settings
    await setAppConfig({
      debugMode: false,
    });
  } else if (details.reason === 'update') {
    logger.info(`Extension updated from ${details.previousVersion} to ${browser.runtime.getManifest().version}`);
  }
});

// Listen for messages from ContentScript
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'contentScriptReady') {
    logger.debug('Content script ready notification received', sender.tab?.url);
    return Promise.resolve({ success: true });
  }
  
  // Must return true or Promise<any>
  return Promise.resolve(false);
}); 