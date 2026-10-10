import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectApi, disputeApi, callSessionApi } from '../../services/apiClient';
import { Project, FinancialLedgerEntry, ProjectMilestone } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  MessageSquare,
  ShieldCheck,
  Upload,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  PhoneCall,
  Scale
} from 'lucide-react';
import { CreateDisputeModal } from '../../components/disputes/CreateDisputeModal';
import { DisputeDetailModal } from '../../components/disputes/DisputeDetailModal';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';

  const [project, setProject] = useState<Project | null>(null);
  const [ledger, setLedger] = useState<FinancialLedgerEntry[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dispute Modals
  const [isCreateDisputeOpen, setIsCreateDisputeOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  // Milestone Action State
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionMediaUrl, setSubmissionMediaUrl] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isBrand = user?.role === 'brand';
  const isCreator = user?.role === 'creator';
  const currentUserId = user?._id || (user as any)?.id;

  const fetchProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getProjectById(id);
      setProject(data.project);
      setLedger(data.ledger || []);

      // Fetch disputes & calls for project
      try {
        const myDisputes = await disputeApi.getMyDisputes();
        setDisputes((myDisputes || []).filter((d: any) => d.projectId?._id === id || d.projectId === id));
      } catch (err) {
        console.error('Failed to load project disputes', err);
      }

      try {
        const projectCalls = await callSessionApi.getProjectCalls(id);
        setCalls(projectCalls || []);
      } catch (err) {
        console.error('Failed to load project call history', err);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleSubmitWork = async (milestoneId: string) => {
    if (!id || !submissionNotes.trim()) {
      alert('Please provide submission notes describing your completed work.');
      return;
    }
    try {
      setActionLoading(milestoneId);
      await projectApi.submitMilestoneWork(id, milestoneId, { submissionNotes, submissionMediaUrl });
      setSubmittingMilestoneId(null);
      setSubmissionNotes('');
      setSubmissionMediaUrl('');
      await fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit milestone work');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewWork = async (milestoneId: string, action: 'approve' | 'request_revision') => {
    if (!id) return;
    try {
      setActionLoading(milestoneId);
      await projectApi.reviewMilestoneWork(id, milestoneId, { action, reviewNotes });
      setReviewNotes('');
      await fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review milestone work');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFundMilestone = async (milestone: ProjectMilestone) => {
    if (!id) return;
    try {
      setActionLoading(milestone._id);
      await projectApi.fundMilestone(id, milestone._id, { amount: milestone.amount, currency: project?.currency });
      await fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fund milestone');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReleaseMilestone = async (milestoneId: string) => {
    if (!id) return;
    try {
      setActionLoading(milestoneId);
      await projectApi.releaseMilestone(id, milestoneId);
      await fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to release milestone payment');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Loading project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Project Workspace Unavailable</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'Project not found.'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const brand = typeof project.brandProfileId === 'object' ? project.brandProfileId : null;
  const creator = typeof project.creatorProfileId === 'object' ? project.creatorProfileId : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Create Dispute Modal */}
      {id && (
        <CreateDisputeModal
          projectId={id}
          projectTitle={project.title}
          isOpen={isCreateDisputeOpen}
          onClose={() => setIsCreateDisputeOpen(false)}
          onSuccess={() => fetchProject()}
        />
      )}

      {/* Dispute Detail Workspace Modal */}
      {selectedDisputeId && (
        <DisputeDetailModal
          disputeId={selectedDisputeId}
          currentUserId={currentUserId}
          onClose={() => setSelectedDisputeId(null)}
          onRefresh={() => fetchProject()}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="mb-6 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Projects
        </button>

        {/* Project Header Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-cyan-300 border border-slate-700">
                  {project.status.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">{project.title}</h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">{project.description}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/messages?project=${project._id}`)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Open Project Chat
              </button>
              <button
                onClick={() => setIsCreateDisputeOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> File Dispute
              </button>
            </div>
          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Total Value</span>
              <p className="text-base font-bold text-emerald-400">
                {project.currency} {project.totalAmount?.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Hired Creator</span>
              <p className="font-semibold text-slate-200">{creator?.name || 'Creator'}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Brand Partner</span>
              <p className="font-semibold text-slate-200">{brand?.companyName || 'Brand'}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Revision Terms</span>
              <p className="font-semibold text-slate-200">{project.revisionLimit} Revisions Allowed</p>
            </div>
          </div>
        </div>

        {/* Milestones & Escrow Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Milestones Workspace (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Project Milestones ({project.milestones?.length || 0})
            </h2>

            {project.milestones && project.milestones.length > 0 ? (
              <div className="space-y-4">
                {project.milestones.map((m) => (
                  <div key={m._id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono">Milestone #{m.sequence}</span>
                        <h3 className="text-base font-bold text-white">{m.title}</h3>
                        {m.description && <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-emerald-400 text-sm">
                          {project.currency} {m.amount.toLocaleString()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Payment State Badge */}
                    <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400">Escrow Payment State:</span>
                      <span className="font-semibold text-slate-200 uppercase font-mono text-[11px]">
                        {m.paymentState.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Submissions & Work Link Display */}
                    {m.submissionNotes && (
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                        <span className="text-slate-400 font-semibold block">Creator Deliverable Notes:</span>
                        <p className="text-slate-200">{m.submissionNotes}</p>
                        {m.submissionMediaUrl && (
                          <a
                            href={m.submissionMediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:underline pt-1 text-[11px]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Deliverable Assets
                          </a>
                        )}
                      </div>
                    )}

                    {m.reviewNotes && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-400 font-semibold block">Brand Feedback:</span>
                        <p className="text-slate-300">{m.reviewNotes}</p>
                      </div>
                    )}

                    {/* Role-Specific Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800/60">
                      {/* Creator Actions */}
                      {isCreator && m.status !== 'approved' && (
                        <button
                          onClick={() => setSubmittingMilestoneId(m._id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> {m.status === 'submitted' ? 'Resubmit Deliverable' : 'Submit Deliverable'}
                        </button>
                      )}

                      {/* Brand Actions */}
                      {isBrand && (
                        <>
                          {/* Fund milestone if unfunded */}
                          {m.paymentState === 'unfunded' && (
                            <button
                              onClick={() => handleFundMilestone(m)}
                              disabled={actionLoading === m._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                            >
                              Fund Escrow ({project.currency} {m.amount})
                            </button>
                          )}

                          {/* Review submitted work */}
                          {m.status === 'submitted' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReviewWork(m._id, 'request_revision')}
                                disabled={actionLoading === m._id}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                              >
                                Request Revision
                              </button>
                              <button
                                onClick={() => handleReviewWork(m._id, 'approve')}
                                disabled={actionLoading === m._id}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Work
                              </button>
                            </div>
                          )}

                          {/* Release payment if approved & funded but not released */}
                          {m.status === 'approved' && m.paymentState !== 'released_simulated' && m.paymentState !== 'released_verified' && (
                            <button
                              onClick={() => handleReleaseMilestone(m._id)}
                              disabled={actionLoading === m._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center gap-1"
                            >
                              Release Escrow Funds
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Inline Creator Submission Form */}
                    {submittingMilestoneId === m._id && (
                      <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-3">
                        <h4 className="text-xs font-bold text-white">Submit Deliverable Work</h4>
                        <textarea
                          rows={3}
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          placeholder="Describe the completed work, links, or rendering details..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="text"
                          value={submissionMediaUrl}
                          onChange={(e) => setSubmissionMediaUrl(e.target.value)}
                          placeholder="Optional deliverable asset URL (e.g. Drive, Cloudinary, Dropbox)"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setSubmittingMilestoneId(null)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitWork(m._id)}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs"
                          >
                            Submit Deliverable
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
                No milestone tasks defined.
              </div>
            )}
          </div>

          {/* Right Sidebar: Disputes, Call Log & Financial Audit */}
          <div className="space-y-6">
            {/* Disputes Log */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Project Disputes ({disputes.length})
                </h3>
                <button
                  onClick={() => setIsCreateDisputeOpen(true)}
                  className="text-[11px] text-rose-400 hover:underline font-semibold"
                >
                  + New Dispute
                </button>
              </div>

              {disputes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No disputes filed for this project.</p>
              ) : (
                <div className="space-y-2.5">
                  {disputes.map((d) => (
                    <div
                      key={d._id}
                      onClick={() => setSelectedDisputeId(d._id)}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white line-clamp-1">{d.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-slate-400 line-clamp-1 text-[11px]">{d.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call History */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <PhoneCall className="w-4 h-4 text-cyan-400" /> WebRTC Call Sessions ({calls.length})
              </h3>

              {calls.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No recent peer calls.</p>
              ) : (
                <div className="space-y-2">
                  {calls.map((c) => (
                    <div key={c._id} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 capitalize">{c.callType} Call</span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(c.createdAt).toLocaleDateString()} • {c.durationSeconds ? `${c.durationSeconds}s` : c.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Ledger Audit Log */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Escrow Financial Ledger
              </h3>

              {ledger.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No ledger entries recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {ledger.map((entry) => (
                    <div key={entry._id} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400 uppercase text-[10px] font-mono">{entry.eventType.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-200 font-semibold">{entry.currency} {entry.amount?.toLocaleString()}</p>
                      {entry.isSimulation && (
                        <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                          SIMULATED — NO REAL MONEY MOVED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
