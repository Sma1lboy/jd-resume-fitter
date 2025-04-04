import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import * as Tabs from '@radix-ui/react-tabs';
import { profileToForm, formToProfile } from '@utils/profileConverters';
import ManualProfileInput, { UserProfileForm } from './ManualProfileInput';
import JsonProfileImport from './JsonProfileImport';
import ResumeTemplateEditor from './ResumeTemplateEditor';
import JobDescriptionInput from './JobDescriptionInput';
import Logo from '@/components/Logo';
import { UserProfile } from '@/types';

// Improved debounce function that allows input modifications during pending operations
const debounce = <F extends (...args: any[]) => Promise<any>>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let latestArgs: Parameters<F> | null = null;

  return (...args: Parameters<F>): void => {
    // Always update the latest args
    latestArgs = args;

    // Clear any existing timeout
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    // Schedule a new operation with the latest args
    timeout = setTimeout(async () => {
      if (latestArgs) {
        const argsToUse = latestArgs;
        latestArgs = null; // Clear latest args

        try {
          await func(...argsToUse); // Execute with the latest args
        } catch (error) {
          console.error('Error in debounced function:', error);
        }
      }
    }, waitFor);
  };
};

const Options: React.FC = () => {
  // Tab state for switching between manual input and JSON import
  const [inputMethod, setInputMethod] = React.useState<string>('manual');

  // JSON import state
  const [jsonInput, setJsonInput] = React.useState<string>('');
  const [jsonError, setJsonError] = React.useState<string>('');

  const [profile, setProfile] = React.useState<UserProfileForm>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
    languages: '',
  });

  const [status, setStatus] = React.useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<string>('');

  // Load profile on component mount
  React.useEffect(() => {
    loadProfile();
  }, []);

  // Load user profile from storage
  const loadProfile = async (): Promise<void> => {
    try {
      const data = await browser.storage.local.get('userProfile');
      if (data.userProfile) {
        const userProfile = JSON.parse(data.userProfile) as UserProfile;

        // Convert UserProfile to UserProfileForm using utility function
        const formattedProfile = profileToForm(userProfile);

        setProfile(formattedProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setStatus('Error loading profile');
    }
  };

  // Save profile to storage
  const saveProfile = async (): Promise<void> => {
    try {
      // Convert UserProfileForm to UserProfile using utility function
      const storageProfile = formToProfile(profile);

      await browser.storage.local.set({
        userProfile: JSON.stringify(storageProfile),
      });

      setStatus('Profile saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatus(
        `Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Reset profile to empty state
  const resetProfile = async (): Promise<void> => {
    try {
      const emptyProfile: UserProfileForm = {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
        summary: '',
        skills: '',
        experience: '',
        education: '',
        certifications: '',
        languages: '',
      };
      
      // Update state with empty profile
      setProfile(emptyProfile);
      
      // Save empty profile to storage
      const storageProfile = formToProfile(emptyProfile);
      await browser.storage.local.set({
        userProfile: JSON.stringify(storageProfile),
      });
      
      setStatus('Profile reset successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error resetting profile:', error);
      setStatus(
        `Error resetting profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // No auto-save functionality - only update the state
  const updateProfileState = React.useCallback(
    (updatedProfile: UserProfileForm) => {
      // Just update the state, don't save to storage
      setProfile(updatedProfile);
    },
    []
  );

  // Handle profile field changes - only update state, don't save
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    const updatedProfile = {
      ...profile,
      [name]: value,
    };
    // Only update state, don't save to storage
    setProfile(updatedProfile);
  };

  // Handle JSON input changes
  const handleJsonInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setJsonInput(e.target.value);
    setJsonError('');
  };

  // Import profile from JSON
  const importProfileFromJson = async (): Promise<void> => {
    try {
      if (!jsonInput.trim()) {
        setJsonError('Please enter JSON data');
        return;
      }

      const jsonData = JSON.parse(jsonInput);

      const requiredFields = [
        'name',
        'title',
        'email',
        'skills',
        'experience',
        'education',
      ];
      const missingFields = requiredFields.filter(field => !jsonData[field]);

      if (missingFields.length > 0) {
        setJsonError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      const newProfile: UserProfileForm = {
        name: jsonData.name,
        title: jsonData.title,
        email: jsonData.email,
        phone: jsonData.phone || '',
        location: jsonData.location || '',
        linkedin: jsonData.linkedin || '',
        github: jsonData.github || '',
        website: jsonData.website || '',
        summary: jsonData.summary || '',
        skills: Array.isArray(jsonData.skills)
          ? jsonData.skills.join(', ')
          : jsonData.skills,
        experience: JSON.stringify(jsonData.experience || [], null, 2),
        education: JSON.stringify(jsonData.education || [], null, 2),
        certifications: JSON.stringify(jsonData.projects || [], null, 2),
        languages: JSON.stringify(jsonData.languages || [], null, 2),
      };

      setProfile(newProfile);

      try {
        // Convert UserProfileForm to UserProfile
        const storageProfile = formToProfile(newProfile);

        await browser.storage.local.set({
          userProfile: JSON.stringify(storageProfile),
        });

        setStatus('Profile imported and saved successfully!');
      } catch (storageError) {
        console.error('Error saving imported profile to storage:', storageError);
        setStatus(
          `Profile imported but not saved: ${
            storageError instanceof Error ? storageError.message : 'Unknown error'
          }`
        );
      }

      setTimeout(() => setStatus(''), 3000);

      // Switch to manual input tab to show the imported data
      setInputMethod('manual');
    } catch (error) {
      console.error('Error importing profile from JSON:', error);
      setJsonError(
        `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
        Resume Generator Settings
        <Logo size="6" className="ml-2" />
      </h1>

      {status && (
        <div className="bg-green-500 text-white p-3 mb-6 rounded text-center">
          {status}
        </div>
      )}

      {autoSaveStatus && (
        <div className="bg-secondary-500 text-white p-2 mb-4 rounded text-center text-sm fixed bottom-4 right-4 z-50 shadow-md">
          {autoSaveStatus}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <Tabs.Root
          value={inputMethod}
          onValueChange={setInputMethod}
          className="w-full"
        >
          <Tabs.List className="flex bg-gray-100 border-b border-gray-200">
            <Tabs.Trigger
              value="manual"
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              value="template"
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Template
            </Tabs.Trigger>
            <Tabs.Trigger
              value="jobDescription"
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Job Description
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="manual" className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              User Profile
            </h2>
            <ManualProfileInput
              profile={profile}
              onProfileChange={handleProfileChange}
              onProfileUpdate={updatedProfile => {
                // Only update state, don't save to storage
                setProfile(updatedProfile);
              }}
              onSave={saveProfile}
              onReset={resetProfile}
              jsonInput={jsonInput}
              jsonError={jsonError}
              onJsonInputChange={handleJsonInputChange}
              onImportProfile={importProfileFromJson}
            />
          </Tabs.Content>

          <Tabs.Content value="template" className="bg-white p-6">
            <ResumeTemplateEditor onStatusChange={setStatus} />
          </Tabs.Content>

          <Tabs.Content value="jobDescription" className="bg-white p-6">
            <JobDescriptionInput onStatusChange={setStatus} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Options;
