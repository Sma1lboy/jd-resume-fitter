import * as React from 'react';
import * as Label from '@radix-ui/react-label';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4 ">
      {label && (
        <Label.Root htmlFor={id} className="mb-2 block">
          {label}
        </Label.Root>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border  bg-red-200 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
