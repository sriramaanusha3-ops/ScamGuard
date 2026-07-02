import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/supabase';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-200 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-100',
              'placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              'focus:border-primary-500 transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-danger-500 focus:ring-danger-500/50 focus:border-danger-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-danger-400">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-dark-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-200 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-100',
            'placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            'focus:border-primary-500 transition-all duration-200 resize-none',
            error && 'border-danger-500 focus:ring-danger-500/50 focus:border-danger-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-danger-400">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-dark-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-200 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-100',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            'focus:border-primary-500 transition-all duration-200 cursor-pointer',
            error && 'border-danger-500 focus:ring-danger-500/50 focus:border-danger-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm text-danger-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
