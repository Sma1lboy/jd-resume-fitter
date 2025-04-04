import { browser } from 'webextension-polyfill-ts';
import { OpenAISettings, UserProfile } from '@/types';
import { logger } from './logger';

// Default timeout
const DEFAULT_TIMEOUT = 5000;

// Default OpenAI settings
export const defaultOpenAISettings: OpenAISettings = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
};

// Default user configuration
export const defaultUserConfig = {
  theme: 'light',
  language: 'en',
  openAISettings: defaultOpenAISettings,
  debugMode: false,
};

// Default app configuration
export const defaultAppConfig = {
  version: '1.0.0',
  debugMode: false,
  lastUpdated: new Date().toISOString(),
};

/**
 * Generic Chrome Storage read method with timeout handling
 */
async function getStorageItem<T>(
  key: string, 
  defaultValue: T, 
  timeoutMs = DEFAULT_TIMEOUT,
  useSync = false
): Promise<T> {
  try {
    logger.info(`Loading ${key} from ${useSync ? 'sync' : 'local'} storage...`);
    
    const storage = useSync ? browser.storage.sync : browser.storage.local;
    const storagePromise = storage.get(key);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Loading ${key} timed out`)), timeoutMs);
    });

    const data = await Promise.race([storagePromise, timeoutPromise]) as Record<string, any>;
    logger.info(`Storage data for ${key}: ${data && data[key] ? 'Found' : 'Not found'}`);
    
    const nonJsonKeys = ['resumeTemplate'];
    
    if (data && data[key]) {
      try {
        if (nonJsonKeys.includes(key)) {
          return data[key] as T;
        }
        
        if (typeof data[key] === 'string') {
          return JSON.parse(data[key]);
        }
        return data[key];
      } catch (parseError) {
        logger.error(`Error parsing ${key} data: ${parseError}`);
        return defaultValue;
      }
    }
    
    logger.info(`No ${key} found, using default`);
    return defaultValue;
  } catch (error) {
    logger.error(`Error loading ${key}: ${error}`);
    return defaultValue;
  }
}

/**
 * Generic Chrome Storage save method with timeout handling
 */
async function setStorageItem<T>(
  key: string, 
  value: T, 
  timeoutMs = DEFAULT_TIMEOUT,
  useSync = false
): Promise<boolean> {
  try {
    logger.info(`Saving ${key} to ${useSync ? 'sync' : 'local'} storage...`);
    
    const nonJsonKeys = ['resumeTemplate'];
    
    let valueToStore = value;
    
    // 仅对非特殊键的对象进行JSON序列化
    if (typeof value === 'object' && !nonJsonKeys.includes(key)) {
      valueToStore = JSON.stringify(value) as any;
    }
    
    const storage = useSync ? browser.storage.sync : browser.storage.local;
    const savePromise = storage.set({ [key]: valueToStore });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Saving ${key} timed out`)), timeoutMs);
    });

    await Promise.race([savePromise, timeoutPromise]);
    logger.info(`Successfully saved ${key} to storage`);
    return true;
  } catch (error) {
    logger.error(`Error saving ${key}: ${error}`);
    return false;
  }
}

/**
 * Get user configuration
 */
export async function getUserConfig(): Promise<{
  theme: string;
  language: string;
  openAISettings: OpenAISettings;
  debugMode: boolean;
}> {
  return getStorageItem('userConfig', defaultUserConfig);
}

/**
 * Save user configuration
 */
export async function setUserConfig(config: Partial<{
  theme: string;
  language: string;
  openAISettings: OpenAISettings;
  debugMode: boolean;
}>): Promise<boolean> {
  // Get current configuration first
  const currentConfig = await getUserConfig();
  
  // Merge updates
  const newConfig = {
    ...currentConfig,
    ...config,
  };
  
  // Dispatch event if debug mode changed
  if (config.debugMode !== undefined && config.debugMode !== currentConfig.debugMode) {
    document.dispatchEvent(
      new CustomEvent('debug-mode-changed', { detail: { enabled: config.debugMode } })
    );
  }
  
  return setStorageItem('userConfig', newConfig);
}

/**
 * Check if debug mode is enabled
 */
export async function isDebugMode(): Promise<boolean> {
  const userConfig = await getUserConfig();
  return userConfig.debugMode;
}

/**
 * Set debug mode
 */
export async function setDebugMode(enabled: boolean): Promise<boolean> {
  return setUserConfig({ debugMode: enabled });
}

/**
 * Get user profile configuration
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  return getStorageItem('userProfile', null);
}

/**
 * Save user profile configuration
 */
export async function setUserProfile(profile: UserProfile): Promise<boolean> {
  return setStorageItem('userProfile', profile);
}

/**
 * Get OpenAI settings
 */
export async function getOpenAISettings(): Promise<OpenAISettings> {
  // First try to get from user config
  const userConfig = await getUserConfig();
  
  if (userConfig.openAISettings && userConfig.openAISettings.apiKey) {
    return userConfig.openAISettings;
  }
  
  // If not found in user config, try to get from separate storage
  return getStorageItem('openAISettings', defaultOpenAISettings);
}

/**
 * Save OpenAI settings
 */
export async function setOpenAISettings(settings: OpenAISettings): Promise<boolean> {
  // Update user config as well
  const userConfig = await getUserConfig();
  await setUserConfig({
    ...userConfig,
    openAISettings: settings,
  });
  
  // Also save a separate copy
  return setStorageItem('openAISettings', settings);
}

/**
 * Parse OpenAI settings from storage
 */
export function parseOpenAISettings(settingsJson: string | undefined): OpenAISettings {
  try {
    if (!settingsJson) {
      return { ...defaultOpenAISettings };
    }
    const parsed = JSON.parse(settingsJson) as Partial<OpenAISettings>;
    return {
      endpoint: parsed.endpoint || defaultOpenAISettings.endpoint,
      apiKey: parsed.apiKey || defaultOpenAISettings.apiKey,
      model: parsed.model || defaultOpenAISettings.model,
    };
  } catch (error) {
    logger.error('Error parsing OpenAI settings:', error);
    return { ...defaultOpenAISettings };
  }
}

/**
 * Stringify OpenAI settings for storage
 */
export function stringifyOpenAISettings(settings: OpenAISettings): string {
  try {
    return JSON.stringify(settings);
  } catch (error) {
    logger.error('Error stringifying OpenAI settings:', error);
    return JSON.stringify(defaultOpenAISettings);
  }
}

/**
 * Get app configuration
 */
export async function getAppConfig(): Promise<{
  version: string;
  debugMode: boolean;
  lastUpdated: string;
}> {
  return getStorageItem('appConfig', defaultAppConfig);
}

/**
 * Save app configuration
 */
export async function setAppConfig(config: Partial<{
  version: string;
  debugMode: boolean;
  lastUpdated: string;
}>): Promise<boolean> {
  // Get current configuration first
  const currentConfig = await getAppConfig();
  
  // Merge updates
  const newConfig = {
    ...currentConfig,
    ...config,
    lastUpdated: new Date().toISOString(), // Always update last modified time
  };
  
  return setStorageItem('appConfig', newConfig);
}

/**
 * Get resume template
 */
export async function getResumeTemplate(): Promise<string | null> {
  return getStorageItem('resumeTemplate', null);
}

/**
 * Save resume template
 */
export async function setResumeTemplate(template: string): Promise<boolean> {
  return setStorageItem('resumeTemplate', template);
}

/**
 * Get list of recent resumes
 */
export async function getRecentResumes(): Promise<any[]> {
  return getStorageItem('recentResumes', []);
}

/**
 * Add a new resume to the recent list
 */
export async function addRecentResume(resume: any): Promise<boolean> {
  const recentResumes = await getRecentResumes();
  
  // Add to the beginning of the list
  recentResumes.unshift({
    ...resume,
    createdAt: new Date().toISOString(),
  });
  
  // Limit to 10 items
  const limitedResumes = recentResumes.slice(0, 10);
  
  return setStorageItem('recentResumes', limitedResumes);
} 