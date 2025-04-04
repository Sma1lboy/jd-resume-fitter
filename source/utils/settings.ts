import { browser } from 'webextension-polyfill-ts';

export interface Settings {
  debugMode: boolean;
  openaiApiKey?: string;
  openaiModel?: string;
}

const defaultSettings: Settings = {
  debugMode: false,
  openaiModel: 'gpt-3.5-turbo'
};


export async function getSettings(): Promise<Settings> {
  try {
    const result = await browser.storage.sync.get(Object.keys(defaultSettings));
    return { ...defaultSettings, ...result };
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}


export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  try {
    await browser.storage.sync.set(settings);
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}


export async function isDebugMode(): Promise<boolean> {
  try {
    const { debugMode } = await getSettings();
    return debugMode;
  } catch (error) {
    console.error('Error checking debug mode:', error);
    return false;
  }
}

export async function setDebugMode(enabled: boolean): Promise<void> {
  try {
    await saveSettings({ debugMode: enabled });
    document.dispatchEvent(new CustomEvent('debug-mode-changed', { detail: { enabled } }));
  } catch (error) {
    console.error('Error setting debug mode:', error);
  }
} 