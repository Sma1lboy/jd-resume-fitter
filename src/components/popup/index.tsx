import * as React from 'react';
import { browser, Tabs as BrowserTabs } from 'webextension-polyfill-ts';
import * as Tabs from '@radix-ui/react-tabs';
import Logo from '@/components/Logo';

import { Input } from '@/components/ui/input';
import { InputField } from '@/components/ui/form-field';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OpenAISettings, UserProfile } from '@/types';
import { defaultOpenAISettings, parseOpenAISettings, stringifyOpenAISettings } from '@/utils/config';

function openWebPage(url: string): Promise<BrowserTabs.Tab> {
  return browser.tabs.create({ url });
}

// Removed predefined model options to allow user input
interface ResumeItem {
  id: string;
  date: string;
  content: string;
  preview: string;
  jobDescription: string;
}

const Popup: React.FC = () => {
  const [settings, setSettings] = React.useState<OpenAISettings>(
    defaultOpenAISettings
  );
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saveStatus, setSaveStatus] = React.useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<string>('');
  const [recentResumes, setRecentResumes] = React.useState<ResumeItem[]>([]);
  const [copyStatus, setCopyStatus] = React.useState<{ [key: string]: string }>(
    {}
  );

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await browser.storage.local.get('openAISettings');
        const loadedSettings = parseOpenAISettings(data.openAISettings);
        if (loadedSettings) {
          setSettings(loadedSettings);
        }
      } catch (error) {
        console.error('Error loading OpenAI settings:', error);
      }
    };

    const loadData = async () => {
      await loadSettings();
      await loadProfile();
      await loadRecentResumes();
      setLoading(false);
    };
    loadData();
  }, []); 

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

  // Load recently generated resumes from storage
  const loadRecentResumes = async () => {
    try {
      const data = await browser.storage.local.get('recentlyResumeList');
      if (data.recentlyResumeList) {
        setRecentResumes(data.recentlyResumeList);
      }
    } catch (error) {
      console.error('Error loading recent resumes:', error);
    }
  };

  // Copy resume content to clipboard
  const copyResumeToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus({ ...copyStatus, [id]: 'Copied!' });
      setTimeout(() => {
        setCopyStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[id];
          return newStatus;
        });
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setCopyStatus({ ...copyStatus, [id]: 'Failed to copy' });
      setTimeout(() => {
        setCopyStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[id];
          return newStatus;
        });
      }, 2000);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (e) {
      return dateString;
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
  // No auto-save functionality - only update the state
  const updateSettingsState = React.useCallback(
    (updatedSettings: OpenAISettings) => {
      // Just update the state, don't save to storage
      setSettings(updatedSettings);
    },
    []
  );

  // Handle settings field changes - only update state, don't save
  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Update settings directly
    const updatedSettings = {
      ...settings,
      [name]: value,
    };
    // Only update state, don't save to storage
    setSettings(updatedSettings);
  };
  console.log('Settings:', settings);

  return (
    <div className="w-96 p-4 font-sans">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center">
        Resume Generator
        <Logo size="6" className="ml-2" />
      </h1>

      {saveStatus && (
        <div className="bg-secondary-500 text-white p-2 mb-4 rounded text-center text-sm">
          {saveStatus}
        </div>
      )}

      {autoSaveStatus && (
        <div className="bg-secondary-500 text-white p-2 rounded text-center text-sm fixed bottom-4 right-4 z-50 shadow-md">
          {autoSaveStatus}
        </div>
      )}

      <div className="border border-gray-200 rounded overflow-hidden mb-4">
        <Tabs.Root defaultValue="resumes" className="w-full">
          <Tabs.List className="flex bg-gray-100 border-b border-gray-200">
            <Tabs.Trigger
              value="resumes"
              className="px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Recent Resumes
            </Tabs.Trigger>
            <Tabs.Trigger
              value="profile"
              className="px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              value="settings"
              className="px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Settings
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
                className="w-full bg-primary-500 hover:bg-primary-600 text-primary-foreground font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
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
                    className="bg-primary-500 hover:bg-primary-600 text-primary-foreground font-medium py-2 px-4 rounded text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
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

          {/* Recent Resumes Tab */}
          <Tabs.Content value="resumes" className="p-4">
            {loading && <div className="text-center py-4">Loading...</div>}

            {!loading && recentResumes.length === 0 && (
              <div className="text-center py-4">
                <p className="mb-3 text-gray-600">
                  No resumes generated yet. Use the context menu on job
                  descriptions to generate resumes.
                </p>
              </div>
            )}

            {!loading && recentResumes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm mb-2">
                  Recently Generated Resumes
                </h3>

                {recentResumes.map(resume => (
                  <Card
                    key={resume.id}
                    className="p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(resume.date)}
                      </Badge>
                      <button
                        type="button"
                        onClick={() =>
                          copyResumeToClipboard(resume.content, resume.id)
                        }
                        className={`text-xs px-2 py-1 rounded ${
                          copyStatus[resume.id]
                            ? 'bg-green-100 text-green-800'
                            : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        }`}
                      >
                        {copyStatus[resume.id] || 'Copy'}
                      </button>
                    </div>

                    <div className="text-sm mb-2 line-clamp-2 text-gray-700">
                      <strong>Job:</strong> {resume.jobDescription}
                    </div>

                    <div className="text-sm line-clamp-3 text-gray-600 bg-gray-50 p-2 rounded">
                      {resume.preview}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <div className="text-center text-xs text-gray-500 flex max-w-full justify-between align-middle items-center">
        <p>Resume Generator v1.0.0</p>
        <p className="mt-1">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              openWebPage('options.html');
            }}
            className="text-primary-600 hover:text-primary-800"
          >
            Advanced Settings
          </a>
        </p>
      </div>
    </div>
  );
};

export default Popup;
