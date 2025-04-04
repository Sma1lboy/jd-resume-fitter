import { browser } from 'webextension-polyfill-ts';
import { saveSettings } from './utils/settings';
import { contentLogger } from './utils/debugLogger';

// Handle installation and updates
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    contentLogger.info('Extension installed');
    
    // Initialize default settings
    await saveSettings({
      debugMode: false,
      openaiModel: 'gpt-3.5-turbo'
    });
  } else if (details.reason === 'update') {
    contentLogger.info(`Extension updated from ${details.previousVersion} to ${browser.runtime.getManifest().version}`);
  }
});

// Listen for messages from ContentScript
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'contentScriptReady') {
    contentLogger.debug('Content script ready notification received', sender.tab?.url);
    return Promise.resolve({ success: true });
  }
  
  // Must return true or Promise<any>
  return Promise.resolve(false);
}); 