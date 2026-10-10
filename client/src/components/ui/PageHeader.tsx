import React from 'react';
import { Badge } from './Badge';

export interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ badge, title, description, actions }) => {
  return (
    <div className="relative py-12 md:py-16 border-b border-white/5 bg-radial-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            {badge && <Badge variant="neon">{badge}</Badge>}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              {title}
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">{description}</p>
          </div>
          {actions && <div className="shrink-0 flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
