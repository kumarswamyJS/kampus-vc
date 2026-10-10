import React, { useState } from 'react';
import { CampaignBrief } from '../../types';
import { proposalApi } from '../../services/apiClient';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Send, DollarSign, Clock, Layers, Sparkles, AlertCircle } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: CampaignBrief;
  onSuccess: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, brief, onSuccess }) => {
  const [title, setTitle] = useState(`Proposal for ${brief.title}`);
  const [coverMessage, setCoverMessage] = useState('');
  const [proposedApproach, setProposedApproach] = useState('');
  const [proposedBudget, setProposedBudget] = useState(brief.budget?.amount ? String(brief.budget.amount) : '100000');
  const [currency] = useState(brief.budget?.currency || 'INR');
  const [proposedTimeline, setProposedTimeline] = useState('14 days');
  const [revisionTerms, setRevisionTerms] = useState('2 Revisions Included');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverMessage.trim()) {
      setError('Cover message is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await proposalApi.createProposal({
        briefId: brief._id,
        title,
        coverMessage,
        proposedApproach,
        proposedBudget: Number(proposedBudget),
        currency,
        proposedTimeline,
        revisionTerms,
        deliverables: brief.deliverables || [
          { description: 'Final AI Artwork', mediaType: 'image', quantity: 1 }
        ],
        milestones: [
          { title: 'Milestone 1: Concept Drafts & Initial Render', amount: Math.round(Number(proposedBudget) * 0.4), description: 'Initial concept render submission' },
          { title: 'Milestone 2: Final High-Res Deliverables', amount: Math.round(Number(proposedBudget) * 0.6), description: 'Full resolution final assets & source files' }
        ],
      });

      setSaving(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setSaving(false);
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit proposal.');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Submit Proposal: ${brief.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200 text-left pt-2">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Brief Quick Specs Banner */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">Target Budget</span>
            <span className="font-semibold text-emerald-400">
              {brief.budget?.amount ? `${currency} ${brief.budget.amount.toLocaleString()}` : 'Flexible'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Required Deliverables</span>
            <span className="font-semibold text-slate-200">{brief.deliverables?.length || 0} Assets</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Proposal Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Cover Message & Pitch</label>
          <textarea
            rows={4}
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
            placeholder="Explain why you are the ideal creator for this campaign brief..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Proposed Creative Approach</label>
          <textarea
            rows={3}
            value={proposedApproach}
            onChange={(e) => setProposedApproach(e.target.value)}
            placeholder="Detail your proposed AI tools, workflow, and artistic vision..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Proposed Total Budget ({currency})
            </label>
            <input
              type="number"
              min="0"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold text-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Estimated Timeline
            </label>
            <input
              type="text"
              value={proposedTimeline}
              onChange={(e) => setProposedTimeline(e.target.value)}
              placeholder="e.g. 10 days"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" isLoading={saving} type="submit" leftIcon={<Send className="w-4 h-4" />}>
            Submit Official Proposal
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ProposalModal;
