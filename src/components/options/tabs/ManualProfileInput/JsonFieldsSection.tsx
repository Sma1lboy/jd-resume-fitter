import React from 'react';
import { X, Code } from 'lucide-react';
import { UserProfileForm } from '@/types';
import { Button } from '@/components/ui/button';
import { TextareaField } from '@/components/ui/form-field';

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-t border-gray-200 pt-6 mt-6">{children}</div>
);
const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex items-center justify-between mb-3">{children}</div>;

interface JsonFieldsSectionProps {
  profile: Pick<UserProfileForm, 'education' | 'certifications' | 'languages'>; // Only fields still edited as JSON
  showJsonEditor: boolean;
  toggleJsonEditor: () => void;
  onProfileChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Assuming only textareas here
  onProfileBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => Promise<void>;
}

const JsonFieldsSection: React.FC<JsonFieldsSectionProps> = ({
  profile,
  showJsonEditor,
  toggleJsonEditor,
  onProfileChange,
  onProfileBlur,
}) => {
  return (
    <Section>
      <SectionHeader>
        <h3 className="text-lg font-semibold">Advanced Fields (JSON Format)</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleJsonEditor}
          className="ml-2"
        >
          {showJsonEditor ? (
            <>
              <X className="mr-2 h-4 w-4" /> Hide
            </>
          ) : (
            <>
              <Code className="mr-2 h-4 w-4" /> Show
            </>
          )}{' '}
          JSON Editor
        </Button>
      </SectionHeader>

      {showJsonEditor && (
        <>
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-gray-700">
            <p>
              Edit less common sections (Education*, Certifications, Languages)
              directly in JSON format below. (*Education also has a UI above for
              simpler editing).
            </p>
          </div>
          {/* Keep Education, Certifications, Languages */}
          <div className="mb-4">
            <TextareaField
              label="Education (JSON format)"
              id="education"
              name="education" // Add name prop
              placeholder={`[ ... education format ... ]`}
              value={profile?.education ?? ''}
              onChange={onProfileChange}
              onBlur={onProfileBlur}
              className="font-mono text-xs"
              rows={6} // Adjust rows as needed
            />
          </div>
          <div className="mb-4">
            <TextareaField
              label="Certifications (JSON format)"
              id="certifications"
              name="certifications" // Add name prop
              placeholder={`[ ... certifications format ... ]`}
              value={profile?.certifications ?? ''}
              onChange={onProfileChange}
              onBlur={onProfileBlur}
              className="font-mono text-xs"
              rows={6}
            />
          </div>
          <div className="mb-4">
            <TextareaField
              label="Languages (JSON format)"
              id="languages"
              name="languages" // Add name prop
              placeholder={`[ ... languages format ... ]`}
              value={profile?.languages ?? ''}
              onChange={onProfileChange}
              onBlur={onProfileBlur}
              className="font-mono text-xs"
              rows={6}
            />
          </div>
        </>
      )}
    </Section>
  );
};

export default JsonFieldsSection;
