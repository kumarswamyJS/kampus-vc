import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  verified = false,
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl rounded-2xl',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={twMerge(
            clsx('rounded-full object-cover border border-white/10 shadow-md', sizes[size], className)
          )}
        />
      ) : (
        <div
          className={twMerge(
            clsx(
              'rounded-full bg-gradient-to-br from-dark-800 to-dark-750 border border-brand-500/30 text-brand-300 font-bold flex items-center justify-center shadow-md',
              sizes[size],
              className
            )
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-dark-950 flex items-center justify-center text-[8px] text-dark-950 font-bold">
          ✓
        </span>
      )}
    </div>
  );
};
