import * as React from 'react';
import ManualProfileInput, { UserProfileForm } from './ManualProfileInput';
import { formToProfile } from '@utils/profileConverters';
import { browser } from 'webextension-polyfill-ts';

interface ProfileTabProps {
  profile: UserProfileForm;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onProfileUpdate: (updatedProfile: UserProfileForm) => void;
  onStatusChange: (status: string) => void;
  jsonInput: string;
  jsonError: string;
  onJsonInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onImportProfile: () => Promise<void>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  onProfileChange,
  onProfileUpdate,
  onStatusChange,
  jsonInput,
  jsonError,
  onJsonInputChange,
  onImportProfile,
}) => {
  // Save profile to storage
  const saveProfile = async (): Promise<void> => {
    try {
      // Convert UserProfileForm to UserProfile using utility function
      const storageProfile = formToProfile(profile);

      await browser.storage.local.set({
        userProfile: JSON.stringify(storageProfile),
      });

      onStatusChange('Profile saved successfully!');
      setTimeout(() => onStatusChange(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      onStatusChange(
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
      onProfileUpdate(emptyProfile);
      
      // Save empty profile to storage
      const storageProfile = formToProfile(emptyProfile);
      await browser.storage.local.set({
        userProfile: JSON.stringify(storageProfile),
      });
      
      onStatusChange('Profile reset successfully!');
      setTimeout(() => onStatusChange(''), 3000);
    } catch (error) {
      console.error('Error resetting profile:', error);
      onStatusChange(
        `Error resetting profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        User Profile
      </h2>
      <ManualProfileInput
        profile={profile}
        onProfileChange={onProfileChange}
        onProfileUpdate={onProfileUpdate}
        onSave={saveProfile}
        onReset={resetProfile}
        jsonInput={jsonInput}
        jsonError={jsonError}
        onJsonInputChange={onJsonInputChange}
        onImportProfile={onImportProfile}
      />
    </div>
  );
};

export default ProfileTab; 