import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neon' | 'blue' | 'success' | 'warning' | 'outline' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neon',
  size = 'md',
  className,
  ...props
}) => {
  const base = 'inline-flex items-center font-medium rounded-full border transition-colors';
  const variants = {
    neon: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    blue: 'bg-electric-blue/10 border-electric-blue/30 text-electric-blue',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    slate: 'bg-slate-800/80 border-slate-700 text-slate-300',
    outline: 'bg-transparent border-white/15 text-slate-300',
  };
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
