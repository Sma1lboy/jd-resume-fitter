import { OpenAISettings } from './aiWorkflow';

/**
 * Safely parses OpenAI settings from storage
 */
export function parseOpenAISettings(
  settingsJson: string | undefined,
  defaultSettings: OpenAISettings
): OpenAISettings {
  try {
    if (!settingsJson) {
      return defaultSettings;
    }
    return JSON.parse(settingsJson) as OpenAISettings;
  } catch (error) {
    console.error('Error parsing OpenAI settings:', error);
    return defaultSettings;
  }
}

/**
 * Safely stringifies OpenAI settings for storage
 */
export function stringifyOpenAISettings(settings: OpenAISettings): string {
  try {
    return JSON.stringify(settings);
  } catch (error) {
    console.error('Error stringifying OpenAI settings:', error);
    return JSON.stringify(defaultSettings);
  }
}

// Default OpenAI settings
const defaultSettings: OpenAISettings = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
};
