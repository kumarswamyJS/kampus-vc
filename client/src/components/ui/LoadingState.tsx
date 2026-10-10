import React from 'react';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading Kampus.VC...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-brand-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin"></div>
      </div>
      <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{label}</p>
    </div>
  );
};
