import React, { useState } from 'react';
import { disputeApi } from '../../services/apiClient';
import { X, ShieldAlert, Loader2 } from 'lucide-react';

interface CreateDisputeModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDisputeModal: React.FC<CreateDisputeModalProps> = ({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState<string>('deliverable_quality');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestedResolution, setRequestedResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !requestedResolution.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await disputeApi.createDispute(projectId, {
        category,
        title: title.trim(),
        description: description.trim(),
        requestedResolution: requestedResolution.trim(),
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to file dispute');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert size={22} />
            <h2 className="text-lg font-bold text-white">Open Project Dispute</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mt-2">
          Filing a dispute for project <strong className="text-white">{projectTitle}</strong>. Kampus.VC dispute resolution will log all evidence and discussion transparently.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Dispute Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="deliverable_quality">Deliverable Quality Issues</option>
              <option value="missed_deadline">Missed Project Deadline</option>
              <option value="scope_disagreement">Scope or Brief Disagreement</option>
              <option value="revision_disagreement">Revision Limit Disagreement</option>
              <option value="communication_issue">Unresponsive / Communication Failure</option>
              <option value="payment_status">Milestone Release / Payment Issue</option>
              <option value="licensing_disagreement">IP / Licensing Disagreement</option>
              <option value="other">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Dispute Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title summarizing the disagreement"
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Description of the Issue *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide specific details about what occurred, agreed dates, and specific concerns..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Requested Fair Resolution *</label>
            <textarea
              value={requestedResolution}
              onChange={(e) => setRequestedResolution(e.target.value)}
              rows={2}
              placeholder="State your proposed solution (e.g. 1 additional revision, partial refund, extended deadline)..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              File Official Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
