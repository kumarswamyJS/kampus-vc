import React from 'react';
import { Proposal } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { CheckCircle2, DollarSign, Clock, Layers, Sparkles, UserCheck } from 'lucide-react';

interface ProposalComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: Proposal[];
  onAccept: (proposalId: string) => void;
}

export const ProposalComparisonModal: React.FC<ProposalComparisonModalProps> = ({
  isOpen,
  onClose,
  proposals,
  onAccept,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Side-by-Side Proposal Comparison">
      <div className="space-y-4 pt-2 text-left">
        <p className="text-slate-400 text-xs">
          Compare incoming creator proposals side by side. Review budget, deliverables, timeline, and commercial terms before accepting.
        </p>

        {proposals.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No proposals available to compare.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-2">
            {proposals.map((prop) => {
              const creator = typeof prop.creatorProfileId === 'object' ? prop.creatorProfileId : null;
              return (
                <div
                  key={prop._id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Creator Header */}
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase">
                        {creator?.name?.[0] || 'C'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{creator?.name || 'Creator'}</h4>
                        <span className="text-xs text-cyan-400 font-mono">@{creator?.handle || 'creator'}</span>
                      </div>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-2">{prop.title}</h5>

                    <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">{prop.coverMessage}</p>

                    {/* Compare Attributes */}
                    <div className="space-y-2 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Proposed Budget
                        </span>
                        <span className="font-bold text-emerald-400">
                          {prop.currency} {prop.proposedBudget?.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" /> Timeline
                        </span>
                        <span className="font-semibold text-slate-200">{prop.proposedTimeline}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" /> Milestones
                        </span>
                        <span>{prop.milestones?.length || 1} Milestones</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => onAccept(prop._id)}
                      leftIcon={<UserCheck className="w-4 h-4" />}
                    >
                      Accept Proposal & Hire
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ProposalComparisonModal;
