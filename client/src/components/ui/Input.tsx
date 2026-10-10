import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <span className="absolute left-3.5 text-slate-400 pointer-events-none">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-dark-900/90 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500',
                className
              )
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3.5 text-slate-400">{rightIcon}</span>}
        </div>
        {error && <p className="text-xs text-red-400 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
