import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { formToProfile } from '@utils/profileConverters';
import { MotionDialog, DialogHeader, DialogTitle } from '@components/ui/dialog';
import JsonProfileImport from '@/components/options/JsonProfileImport';
import PdfProfileImport from '@/components/options/PdfProfileImport';
import { UserProfileForm } from '@/types';

// Import the extracted sections
import ActionButtons from './ActionButtons';
import PersonalInfoSection from './PersonalInfoSection';
import EducationSection from './EducationSection';
import ExperienceSection from './ExperienceSection';
import ProjectSection from './ProjectSection';
import SkillsSection from './SkillsSection';
import CoursesSection from './CoursesSection';
import JsonFieldsSection from './JsonFieldsSection';

// Keep only props needed by this container
interface ManualProfileInputProps {
  profile: UserProfileForm;
  onProfileChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void; // Used by some children still
  onProfileUpdate: (
    updatedProfile: UserProfileForm | Partial<UserProfileForm>
  ) => void; // Allow partial updates
  onSave: () => void;
  onReset: () => void;
  jsonInput?: string;
  jsonError?: string;
  onJsonInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onImportProfile?: () => void;
  onProfileBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => Promise<void>; // Used by some children
}

const ManualProfileInput: React.FC<ManualProfileInputProps> = ({
  profile,
  onProfileChange, // Keep for JsonFieldsSection primarily
  onProfileUpdate,
  onSave,
  onReset,
  jsonInput = '',
  jsonError = '',
  onJsonInputChange = () => {},
  onImportProfile = () => {},
  onProfileBlur, // Keep for JsonFieldsSection primarily
}) => {
  // Modal states remain here
  const [jsonModalOpen, setJsonModalOpen] = React.useState(false);
  const [pdfModalOpen, setPdfModalOpen] = React.useState(false);
  const [showJsonEditor, setShowJsonEditor] = React.useState<boolean>(false);

  // Keep toggle and import handlers here
  const toggleJsonEditor = () => setShowJsonEditor(prev => !prev);
  const handleJsonImport = () => {
    onImportProfile(); // This likely triggers an update via onProfileUpdate from parent
    setJsonModalOpen(false);
  };

  // Simplify the update handler passed down
  const handlePartialUpdate = React.useCallback(
    (update: Partial<UserProfileForm>) => {
      const updatedFullProfile = { ...profile, ...update };
      onProfileUpdate(updatedFullProfile); // Pass the full updated profile up
    },
    [profile, onProfileUpdate]
  );

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-6"
    >
      {/* Action Buttons */}
      <ActionButtons
        onSave={onSave}
        onReset={onReset}
        onPdfImportClick={() => setPdfModalOpen(true)}
        onJsonImportClick={() => setJsonModalOpen(true)}
      />

      {/* Modals */}
      <MotionDialog open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
        <DialogHeader>
          <DialogTitle>Import Profile from JSON</DialogTitle>
        </DialogHeader>
        <JsonProfileImport
          jsonInput={jsonInput}
          jsonError={jsonError}
          onJsonInputChange={onJsonInputChange}
          onImportProfile={handleJsonImport} // Use handler that closes modal
        />
      </MotionDialog>
      <MotionDialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogHeader>
          <DialogTitle>Import Profile from PDF</DialogTitle>
        </DialogHeader>
        {/* PdfProfileImport likely calls onProfileUpdate directly */}
        <PdfProfileImport
          onClose={() => setPdfModalOpen(false)}
          onProfileUpdate={onProfileUpdate}
        />
      </MotionDialog>

      {/* Sections */}
      <div className="border-t border-gray-200 pt-6" />

      <PersonalInfoSection
        profile={profile} // Pass relevant slice
        onProfileChange={onProfileChange} // Use original handler for direct input changes
        onProfileBlur={onProfileBlur} // Pass blur handler
      />

      <EducationSection
        educationJson={profile.education}
        onProfileUpdate={handlePartialUpdate} // Pass partial update handler
      />

      <ExperienceSection
        experienceJson={profile.experience}
        onProfileUpdate={handlePartialUpdate}
      />

      <ProjectSection
        projectsJson={profile.projects}
        onProfileUpdate={handlePartialUpdate}
      />

      <SkillsSection
        skillsString={profile.skills}
        onProfileUpdate={handlePartialUpdate}
      />

      <CoursesSection
        coursesString={profile.courses}
        onProfileUpdate={handlePartialUpdate}
      />

      <JsonFieldsSection
        profile={profile} // Pass needed fields
        showJsonEditor={showJsonEditor}
        toggleJsonEditor={toggleJsonEditor}
        onProfileChange={onProfileChange} // Use original handler
        onProfileBlur={onProfileBlur} // Pass original handler
      />
    </form>
  );
};

export default ManualProfileInput;
