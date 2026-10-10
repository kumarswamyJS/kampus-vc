import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PortfolioItem } from '../../types';
import { Sparkles, ShieldCheck, Wand2, Tag, Calendar, UserCheck } from 'lucide-react';

export interface PortfolioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PortfolioItem | null;
}

export const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={item.title}>
      <div className="space-y-5 text-left max-h-[75vh] overflow-y-auto pr-2">
        {/* Media Preview Box */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-dark-950 border border-white/10 shadow-xl">
          {item.mediaType === 'video' ? (
            <video src={item.mediaUrl} controls autoPlay loop className="w-full h-full object-contain" />
          ) : (
            <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-contain" />
          )}
        </div>

        {/* Category & Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neon">{item.category}</Badge>
          <Badge variant="blue">{item.aiInvolvement}</Badge>
          <Badge variant="slate">{item.commercialLicensing}</Badge>
          {item.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-slate-200 leading-relaxed">{item.description}</p>
        )}

        {/* Tools Used */}
        {item.toolsUsed && item.toolsUsed.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-brand-400" /> Generative AI Pipelines
            </span>
            <div className="flex flex-wrap gap-1.5">
              {item.toolsUsed.map((tool) => (
                <span
                  key={tool}
                  className="text-xs px-2.5 py-1 rounded-lg bg-dark-900 border border-white/10 font-mono text-brand-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Workflow & Prompt Lineage */}
        {item.workflowDescription && (
          <div className="p-3 bg-dark-900/90 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-electric-blue" /> Workflow Lineage
            </span>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.workflowDescription}</p>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Role: {item.projectRole || 'AI Creator'}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
