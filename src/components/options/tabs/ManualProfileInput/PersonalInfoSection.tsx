import React from 'react';
import { UserProfileForm } from '@/types';
import { InputField, TextareaField } from '@/components/ui/form-field';

interface PersonalInfoSectionProps {
  profile: Pick<
    UserProfileForm,
    | 'name'
    | 'title'
    | 'email'
    | 'phone'
    | 'location'
    | 'linkedin'
    | 'github'
    | 'website'
    | 'summary'
  >;
  onProfileChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onProfileBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => Promise<void>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profile,
  onProfileChange,
  onProfileBlur,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Personal Information
        </h3>
      </div>

      <InputField
        label="Full Name"
        type="text"
        id="name"
        name="name"
        value={profile.name}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
      />

      <InputField
        label="Professional Title"
        type="text"
        id="title"
        name="title"
        value={profile.title}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Email"
          type="email"
          id="email"
          name="email"
          value={profile.email}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
        />
        <InputField
          label="Phone"
          type="tel"
          id="phone"
          name="phone"
          value={profile.phone}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
        />
      </div>

      <InputField
        label="Location"
        type="text"
        id="location"
        name="location"
        value={profile.location}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
        placeholder="City, State, Country"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="LinkedIn"
          type="text"
          id="linkedin"
          name="linkedin"
          value={profile.linkedin}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
          placeholder="username (without URL)"
        />
        <InputField
          label="GitHub"
          type="text"
          id="github"
          name="github"
          value={profile.github}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
          placeholder="username (without URL)"
        />
      </div>

      <InputField
        label="Website"
        type="text"
        id="website"
        name="website"
        value={profile.website}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
        placeholder="yourwebsite.com (without http/https)"
      />

      <TextareaField
        label="Professional Summary"
        id="summary"
        name="summary"
        value={profile.summary}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
        placeholder="A brief overview..."
        rows={4}
      />
    </div>
  );
};

export default PersonalInfoSection;
