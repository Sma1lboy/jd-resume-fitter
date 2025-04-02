import * as React from 'react';
import * as Label from '@radix-ui/react-label';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  error,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <Label.Root htmlFor={id} className="mb-2 block">
          {label}
        </Label.Root>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
