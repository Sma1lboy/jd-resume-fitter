import * as React from 'react';
import ResumeTemplateEditor from './ResumeTemplateEditor';

interface TemplateTabProps {
  onStatusChange: (status: string) => void;
}

const TemplateTab: React.FC<TemplateTabProps> = ({ onStatusChange }) => {
  return (
    <div>
      <ResumeTemplateEditor onStatusChange={onStatusChange} />
    </div>
  );
};

export default TemplateTab; 