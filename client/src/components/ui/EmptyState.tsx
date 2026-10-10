import React from 'react';
import { Search } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Search className="w-8 h-8 text-slate-500" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
      <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-white/10 flex items-center justify-center mx-auto">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
