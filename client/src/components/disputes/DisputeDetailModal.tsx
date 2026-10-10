import React, { useEffect, useState } from 'react';
import { disputeApi } from '../../services/apiClient';
import { X, ShieldAlert, Send, FilePlus, CheckCircle2, AlertTriangle, Scale, Loader2 } from 'lucide-react';

interface DisputeDetailModalProps {
  disputeId: string | null;
  currentUserId?: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({
  disputeId,
  currentUserId,
  onClose,
  onRefresh,
}) => {
  const [dispute, setDispute] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  const [settlementTerms, setSettlementTerms] = useState('');
  const [showSettlementForm, setShowSettlementForm] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDispute = async () => {
    if (!disputeId) return;
    try {
      setLoading(true);
      const data = await disputeApi.getDisputeById(disputeId);
      setDispute(data);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to load dispute details');
    }
  };

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  if (!disputeId) return null;

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setActionLoading(true);
      await disputeApi.addResponse(disputeId, replyText.trim());
      setReplyText('');
      setActionLoading(false);
      fetchDispute();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionLoading(false);
      setError(err.response?.data?.error || 'Failed to post reply');
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) return;
    try {
      setActionLoading(true);
      await disputeApi.submitEvidence(disputeId, {
        title: evidenceTitle.trim(),
        mediaUrl: evidenceUrl.trim() || undefined,
      });
      setEvidenceTitle('');
      setEvidenceUrl('');
      setShowEvidenceForm(false);
      setActionLoading(false);
      fetchDispute();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionLoading(false);
      setError(err.response?.data?.error || 'Failed to submit evidence');
    }
  };

  const handleProposeSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementTerms.trim()) return;
    try {
      setActionLoading(true);
      await disputeApi.proposeSettlement(disputeId, settlementTerms.trim());
      setSettlementTerms('');
      setShowSettlementForm(false);
      setActionLoading(false);
      fetchDispute();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionLoading(false);
      setError(err.response?.data?.error || 'Failed to propose settlement');
    }
  };

  const handleAcknowledgeSettlement = async (accept: boolean) => {
    try {
      setActionLoading(true);
      await disputeApi.acknowledgeResolution(disputeId, { accept });
      setActionLoading(false);
      fetchDispute();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionLoading(false);
      setError(err.response?.data?.error || 'Failed to respond to settlement');
    }
  };

  const handleEscalate = async () => {
    try {
      setActionLoading(true);
      await disputeApi.escalate(disputeId, 'Participant requested administrator review.');
      setActionLoading(false);
      fetchDispute();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionLoading(false);
      setError(err.response?.data?.error || 'Failed to escalate dispute');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-rose-400" size={22} />
            <div>
              <h2 className="text-base font-bold text-white">Dispute Resolution Workspace</h2>
              {dispute && <p className="text-xs text-neutral-400">ID: {dispute._id} • Project: {dispute.projectId?.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center text-cyan-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : dispute ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* Status Banner */}
            <div className="p-4 rounded-xl border flex justify-between items-center bg-neutral-950 border-neutral-800">
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Current Status</span>
                <div className="text-lg font-bold text-white capitalize mt-0.5 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dispute.status === 'resolved' ? 'bg-emerald-400' : dispute.status === 'escalated_admin' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  {dispute.status.replace('_', ' ')}
                </div>
              </div>
              <div className="flex gap-2">
                {dispute.status !== 'resolved' && dispute.status !== 'escalated_admin' && (
                  <button
                    onClick={handleEscalate}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold rounded-lg"
                  >
                    <AlertTriangle size={14} /> Escalate to Admin
                  </button>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
              <h3 className="font-bold text-white text-base mb-1">{dispute.title}</h3>
              <p className="text-xs text-neutral-400 mb-3">Filed on {new Date(dispute.createdAt).toLocaleString()} • Category: {dispute.category}</p>
              <div className="space-y-3 text-neutral-300 text-xs">
                <div>
                  <strong className="text-white">Issue Description:</strong>
                  <p className="mt-1 bg-neutral-900 p-3 rounded-lg border border-neutral-800">{dispute.description}</p>
                </div>
                <div>
                  <strong className="text-cyan-400">Requested Resolution:</strong>
                  <p className="mt-1 bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20 text-cyan-200">{dispute.requestedResolution}</p>
                </div>
              </div>
            </div>

            {/* Pending Settlement Proposal */}
            {dispute.settlementProposal && dispute.settlementProposal.status === 'pending' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                  <Scale size={18} /> Pending Settlement Proposal
                </div>
                <p className="text-xs text-neutral-200 mb-3">{dispute.settlementProposal.terms}</p>
                {dispute.settlementProposal.proposedBy !== currentUserId && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcknowledgeSettlement(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg"
                    >
                      Accept Settlement & Resolve
                    </button>
                    <button
                      onClick={() => handleAcknowledgeSettlement(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-rose-400 font-semibold text-xs rounded-lg"
                    >
                      Decline Proposal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Discussion Thread */}
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                <span>Discussion Thread ({dispute.discussion?.length || 0})</span>
                {dispute.status !== 'resolved' && (
                  <button
                    onClick={() => setShowSettlementForm(!showSettlementForm)}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Scale size={14} /> Propose Settlement Terms
                  </button>
                )}
              </h4>

              {showSettlementForm && (
                <form onSubmit={handleProposeSettlement} className="mb-4 p-4 bg-neutral-950 border border-cyan-500/30 rounded-xl space-y-3">
                  <label className="block text-xs font-semibold text-cyan-400">Proposed Mutual Settlement Terms</label>
                  <textarea
                    value={settlementTerms}
                    onChange={(e) => setSettlementTerms(e.target.value)}
                    rows={2}
                    placeholder="E.g., Creator delivers 1 final revision by Friday; Brand approves milestone release..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowSettlementForm(false)} className="text-xs text-neutral-400 px-3 py-1">Cancel</button>
                    <button type="submit" disabled={actionLoading} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg">Submit Settlement Proposal</button>
                  </div>
                </form>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {dispute.discussion?.map((msg: any) => (
                  <div key={msg._id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{msg.senderUserId?.displayName || 'User'}</span>
                      <span className="text-[10px] text-neutral-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-neutral-300">{msg.text}</p>
                  </div>
                ))}
              </div>

              {dispute.status !== 'resolved' && (
                <form onSubmit={handlePostReply} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a message to the dispute thread..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 font-semibold rounded-lg flex items-center gap-1 text-xs">
                    <Send size={14} /> Send
                  </button>
                </form>
              )}
            </div>

            {/* Evidence Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white">Submitted Evidence ({dispute.evidence?.length || 0})</h4>
                <button
                  onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <FilePlus size={14} /> Attach Evidence
                </button>
              </div>

              {showEvidenceForm && (
                <form onSubmit={handleSubmitEvidence} className="mb-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Evidence Title *</label>
                    <input
                      type="text"
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      placeholder="E.g. Approved deliverables link, email agreement"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Media / Link URL (Optional)</label>
                    <input
                      type="text"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowEvidenceForm(false)} className="text-xs text-neutral-400 px-3 py-1">Cancel</button>
                    <button type="submit" disabled={actionLoading} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg">Upload Evidence</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dispute.evidence?.map((ev: any) => (
                  <div key={ev._id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
                    <div className="font-bold text-white mb-1">{ev.title}</div>
                    {ev.mediaUrl && (
                      <a href={ev.mediaUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline block text-[11px] truncate mb-1">
                        {ev.mediaUrl}
                      </a>
                    )}
                    <span className="text-[10px] text-neutral-500">Submitted by {ev.submittedBy?.displayName || 'User'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
