import * as React from 'react';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FormField({ label, id, className, children }: FormFieldProps) {
  return (
    <div className={cn('mb-4', className)}>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

interface InputFieldProps extends React.ComponentProps<typeof Input> {
  label: string;
}

export function InputField({
  label,
  id,
  className,
  ...props
}: InputFieldProps) {
  return (
    <FormField label={label} id={id} className={className}>
      <Input id={id} {...props} />
    </FormField>
  );
}

interface TextareaFieldProps extends React.ComponentProps<typeof Textarea> {
  label: string;
}

export function TextareaField({
  label,
  id,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <FormField label={label} id={id} className={className}>
      <Textarea id={id} {...props} />
    </FormField>
  );
}
