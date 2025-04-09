import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onSave: () => void;
  onReset: () => void;
  onPdfImportClick: () => void;
  onJsonImportClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onReset,
  onPdfImportClick,
  onJsonImportClick,
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPdfImportClick}
        className="border-amber-200 text-amber-700 hover:bg-amber-50"
      >
        <FileText className="h-4 w-4 mr-2" />
        Import from PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onJsonImportClick}
        className="border-primary-200 text-primary-700 hover:bg-primary-50"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import from JSON
      </Button>

      <div className="ml-auto flex gap-2">
        <Button type="button" variant="destructive" onClick={onReset}>
          Reset Profile
        </Button>
        {/* Form onSubmit handles the save, but keep click for potential direct save */}
        <Button type="submit" onClick={onSave}>
          Save Profile
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
