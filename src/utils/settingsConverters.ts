import { OpenAISettings } from '@/types';

// Default OpenAI settings
export const defaultOpenAISettings: OpenAISettings = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
};

/**
 * Safely parses OpenAI settings from storage
 */
export function parseOpenAISettings(
  settingsJson: string | undefined
): OpenAISettings {
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
    console.error('Error parsing OpenAI settings:', error);
    return { ...defaultOpenAISettings };
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
    return JSON.stringify(defaultOpenAISettings);
  }
}
