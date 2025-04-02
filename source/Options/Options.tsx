import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import * as Tabs from '@radix-ui/react-tabs';
import { UserProfile } from '@utils/aiWorkflow';
import { profileToForm, formToProfile } from '@utils/profileConverters';
import ManualProfileInput, { UserProfileForm } from './ManualProfileInput';
import JsonProfileImport from './JsonProfileImport';

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

  // Auto-save profile with debounce
  const debouncedSaveProfile = React.useCallback(
    (updatedProfile: UserProfileForm) => {
      const saveWithDebounce = debounce(
        async (profileToSave: UserProfileForm) => {
          try {
            // Convert UserProfileForm to UserProfile using utility function
            const storageProfile = formToProfile(profileToSave);

            await browser.storage.local.set({
              userProfile: JSON.stringify(storageProfile),
            });

            setAutoSaveStatus('Auto-saved');
            setTimeout(() => setAutoSaveStatus(''), 2000);
          } catch (error) {
            console.error('Error auto-saving profile:', error);
            setAutoSaveStatus('Auto-save failed');
            setTimeout(() => setAutoSaveStatus(''), 3000);
          }
        },
        1000
      );

      saveWithDebounce(updatedProfile);
    },
    []
  );

  // Handle profile field changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    const updatedProfile = {
      ...profile,
      [name]: value,
    };
    setProfile(updatedProfile);

    // Trigger auto-save
    debouncedSaveProfile(updatedProfile);
  };

  // Handle JSON input changes
  const handleJsonInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setJsonInput(e.target.value);
    setJsonError('');
  };

  // Import profile from JSON
  const importProfileFromJson = (): void => {
    try {
      if (!jsonInput.trim()) {
        setJsonError('Please enter JSON data');
        return;
      }

      // Parse the JSON input
      const jsonData = JSON.parse(jsonInput);

      // Check if it's the format with personalInfo or direct UserProfile format
      const isCustomFormat = jsonData.personalInfo && jsonData.workExperience;

      // Convert to UserProfileForm format for the form
      let newProfile: UserProfileForm;

      if (isCustomFormat) {
        // Convert from custom format to UserProfileForm
        newProfile = {
          name: jsonData.personalInfo.name || '',
          title: '', // Not directly in the custom format
          email: jsonData.personalInfo.email || '',
          phone: jsonData.personalInfo.phone || '',
          location: jsonData.education?.[0]?.location || '',
          linkedin: jsonData.personalInfo.linkedin || '',
          github: jsonData.personalInfo.github || '',
          website: '',
          summary: '', // Not directly in the custom format

          // Convert skills arrays to comma-separated string
          skills: [
            ...(jsonData.technicalSkills?.languages || []),
            ...(jsonData.technicalSkills?.frameworksAndTools || []),
          ].join(', '),

          // Convert work experience to JSON string
          experience: JSON.stringify(
            (jsonData.workExperience || []).map(exp => ({
              company: exp.company,
              title: exp.title,
              date: exp.dateRange,
              description: exp.experiencePoints
                .filter(point => point.mustInclude)
                .map(point => point.description),
            })),
            null,
            2
          ),

          // Convert education to JSON string
          education: JSON.stringify(
            (jsonData.education || []).map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              date: edu.dateRange,
            })),
            null,
            2
          ),

          // Convert projects to certifications
          certifications: JSON.stringify(
            (jsonData.projects || []).map(proj => ({
              name: proj.name,
              issuer: proj.technologies || 'N/A',
              date: proj.dateRange || 'N/A',
            })),
            null,
            2
          ),

          // Languages field is empty as it's not directly in the custom format
          languages: JSON.stringify([], null, 2),
        };
      } else {
        // Assume it's already in UserProfile format
        newProfile = {
          name: jsonData.name || '',
          title: jsonData.title || '',
          email: jsonData.email || '',
          phone: jsonData.phone || '',
          location: jsonData.location || '',
          linkedin: jsonData.linkedin || '',
          github: jsonData.github || '',
          website: jsonData.website || '',
          summary: jsonData.summary || '',
          skills: Array.isArray(jsonData.skills)
            ? jsonData.skills.join(', ')
            : '',
          experience: JSON.stringify(jsonData.experience || [], null, 2),
          education: JSON.stringify(jsonData.education || [], null, 2),
          certifications: JSON.stringify(
            jsonData.certifications || [],
            null,
            2
          ),
          languages: JSON.stringify(jsonData.languages || [], null, 2),
        };
      }

      setProfile(newProfile);

      // Trigger auto-save after importing profile
      debouncedSaveProfile(newProfile);

      setStatus('Profile imported successfully!');
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
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Resume Generator Settings
      </h1>

      {status && (
        <div className="bg-green-500 text-white p-3 mb-6 rounded text-center">
          {status}
        </div>
      )}

      {autoSaveStatus && (
        <div className="bg-blue-500 text-white p-2 mb-4 rounded text-center text-sm fixed bottom-4 right-4 z-50 shadow-md">
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
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Manual Input
            </Tabs.Trigger>
            <Tabs.Trigger
              value="json"
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              JSON Import
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
                setProfile(updatedProfile);
                debouncedSaveProfile(updatedProfile);
              }}
              onSave={saveProfile}
            />
          </Tabs.Content>

          <Tabs.Content value="json" className="bg-white p-6">
            <JsonProfileImport
              jsonInput={jsonInput}
              jsonError={jsonError}
              onJsonInputChange={handleJsonInputChange}
              onImportProfile={importProfileFromJson}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Options;
