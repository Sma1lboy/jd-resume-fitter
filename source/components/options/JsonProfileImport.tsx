import * as React from 'react';
import { TextareaField } from '@components/ui/form-field';
import { UserProfileForm } from './tabs/ManualProfileInput';

interface JsonProfileImportProps {
  jsonInput: string;
  jsonError: string;
  onJsonInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onImportProfile: () => void;
}

const JsonProfileImport: React.FC<JsonProfileImportProps> = ({
  jsonInput,
  jsonError,
  onJsonInputChange,
  onImportProfile,
}) => {
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Paste your JSON profile data below. The format should match the
          UserProfile interface with required fields like name, title, email,
          skills, experience, and education.
        </p>
        <TextareaField
          label="JSON Data"
          id="jsonInput"
          rows={15}
          value={jsonInput}
          onChange={onJsonInputChange}
          className="font-mono text-xs"
        />
        {jsonError && <p className="mt-2 text-sm text-red-500">{jsonError}</p>}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onImportProfile}
          className="bg-primary-500 hover:bg-primary-600 text-primary-foreground font-medium py-2 px-4 rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
        >
          Import Profile
        </button>
      </div>
    </div>
  );
};

export default JsonProfileImport;
