import * as React from 'react';
import { browser, Tabs as BrowserTabs } from 'webextension-polyfill-ts';
import * as Tabs from '@radix-ui/react-tabs';
import { UserProfile, OpenAISettings } from '../utils/aiWorkflow';
import {
  parseOpenAISettings,
  stringifyOpenAISettings,
} from '../utils/settingsConverters';
import { Input } from '../components/ui/input';
import { InputField } from '@/components/ui/form-field';

function openWebPage(url: string): Promise<BrowserTabs.Tab> {
  return browser.tabs.create({ url });
}

// Removed predefined model options to allow user input

// Debounce function to limit how often a function can be called
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

const Popup: React.FC = () => {
  const [settings, setSettings] = React.useState<OpenAISettings>({
    endpoint: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o-mini',
  });
  // Removed customModel state since we're using direct input
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saveStatus, setSaveStatus] = React.useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<string>('');

  // Load settings and profile on component mount
  React.useEffect(() => {
    // Load OpenAI settings from storage
    const loadSettings = async () => {
      try {
        const data = await browser.storage.local.get('openAISettings');
        // Use utility function to parse settings
        const loadedSettings = parseOpenAISettings(
          data.openAISettings,
          settings
        );
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading OpenAI settings:', error);
      }
    };

    const loadData = async () => {
      await loadSettings();
      await loadProfile();
      setLoading(false);
    };
    loadData();
  }, [settings]); // Add settings as a dependency

  // Load user profile from storage
  const loadProfile = async () => {
    try {
      const data = await browser.storage.local.get('userProfile');
      if (data.userProfile) {
        setProfile(JSON.parse(data.userProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Save OpenAI settings to storage
  const saveSettings = async () => {
    try {
      // Use utility function to stringify settings
      const settingsJson = stringifyOpenAISettings(settings);
      await browser.storage.local.set({
        openAISettings: settingsJson,
      });
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings');
    }
  };

  // Auto-save settings with debounce
  const debouncedSaveSettings = React.useCallback(
    (updatedSettings: OpenAISettings) => {
      const saveWithDebounce = debounce(
        async (settingsToSave: OpenAISettings) => {
          try {
            // Use utility function to stringify settings
            const settingsJson = stringifyOpenAISettings(settingsToSave);
            await browser.storage.local.set({
              openAISettings: settingsJson,
            });
            setAutoSaveStatus('Auto-saved');
            setTimeout(() => setAutoSaveStatus(''), 2000);
          } catch (error) {
            console.error('Error auto-saving settings:', error);
            setAutoSaveStatus('Auto-save failed');
            setTimeout(() => setAutoSaveStatus(''), 3000);
          }
        },
        1000
      );

      saveWithDebounce(updatedSettings);
    },
    []
  );

  // Handle settings field changes
  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Update settings directly
    const updatedSettings = {
      ...settings,
      [name]: value,
    };
    setSettings(updatedSettings);

    // Trigger auto-save
    debouncedSaveSettings(updatedSettings);
  };

  return (
    <div className="w-96 p-4 font-sans">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">
        Resume Generator
      </h1>

      {saveStatus && (
        <div className="bg-green-500 text-white p-2 mb-4 rounded text-center text-sm">
          {saveStatus}
        </div>
      )}

      {autoSaveStatus && (
        <div className="bg-blue-500 text-white p-2 rounded text-center text-sm fixed bottom-4 right-4 z-50 shadow-md">
          {autoSaveStatus}
        </div>
      )}

      <div className="border border-gray-200 rounded overflow-hidden mb-4">
        <Tabs.Root defaultValue="settings" className="w-full">
          <Tabs.List className="flex bg-gray-100 border-b border-gray-200">
            <Tabs.Trigger
              value="settings"
              className="px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Settings
            </Tabs.Trigger>
            <Tabs.Trigger
              value="profile"
              className="px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Profile
            </Tabs.Trigger>
          </Tabs.List>

          <div className="bg-white">
            {/* Settings Tab */}
            <Tabs.Content value="settings" className="p-4">
              <InputField
                label="OpenAI Endpoint"
                type="text"
                id="endpoint"
                name="endpoint"
                value={settings.endpoint}
                onChange={handleSettingChange}
                placeholder="https://api.openai.com/v1"
                className="mb-3"
              />

              <InputField
                label="API Key"
                type="password"
                id="apiKey"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleSettingChange}
                placeholder="sk-..."
                className="mb-3"
              />

              <InputField
                label="Model"
                type="text"
                id="model"
                name="model"
                value={settings.model}
                onChange={handleSettingChange}
                placeholder="e.g., gpt-3.5-turbo, gpt-4, claude-3-opus-20240229"
                className="mb-3"
              />

              <button
                type="button"
                onClick={saveSettings}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Settings
              </button>
            </Tabs.Content>

            {/* Profile Tab */}
            <Tabs.Content value="profile" className="p-4">
              {loading && <div className="text-center py-4">Loading...</div>}

              {!loading && !profile && (
                <div className="text-center py-4">
                  <p className="mb-3 text-gray-600">
                    No profile found. Please set up your profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => openWebPage('options.html')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Set Up Profile
                  </button>
                </div>
              )}

              {!loading && profile && (
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <h3 className="font-bold text-lg">{profile.name}</h3>
                    <p className="text-gray-600">{profile.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      {profile.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {profile.phone}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {profile.location}
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="font-medium text-sm mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map(skill => (
                        <span
                          key={`skill-${skill}`}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => openWebPage('options.html')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded text-sm focus:outline-none"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Resume Generator v1.0.0</p>
        <p className="mt-1">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              openWebPage('options.html');
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            Advanced Settings
          </a>
        </p>
      </div>
    </div>
  );
};

export default Popup;
