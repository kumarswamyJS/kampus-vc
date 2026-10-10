import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { briefApi, proposalApi, matchingApi } from '../../services/apiClient';
import { CampaignBrief, Proposal, CreatorMatchResult } from '../../types';
import BriefFormModal from '../../components/briefs/BriefFormModal';
import ProposalModal from '../../components/proposals/ProposalModal';
import ProposalComparisonModal from '../../components/proposals/ProposalComparisonModal';
import MatchScoreCard from '../../components/matching/MatchScoreCard';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  FileCheck,
  ShieldAlert,
  Edit3,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Tag,
  Palette,
  Send,
  Users,
  UserCheck
} from 'lucide-react';

export const BriefDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [brief, setBrief] = useState<CampaignBrief | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [matches, setMatches] = useState<Array<{ creator: any; match: CreatorMatchResult }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isBrand = user?.role === 'brand';
  const isCreator = user?.role === 'creator';
  const isOwner = brief && user && (brief.userId === user._id || brief.userId === (user as any).id);

  const fetchBrief = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await briefApi.getBriefById(id);
      setBrief(res.data.brief);

      if (user?.role === 'brand') {
        // Fetch proposals and matches for brand owner
        try {
          const propsData = await proposalApi.getProposalsForBrief(id);
          setProposals(propsData.proposals || []);

          const matchData = await matchingApi.getMatchesForBrief(id);
          setMatches(matchData.matches || []);
        } catch (err) {
          // Ignore secondary fetch errors
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch campaign brief');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
  }, [id, user?.role]);

  const handlePublish = async () => {
    if (!brief) return;
    try {
      setActionLoading(true);
      await briefApi.publishBrief(brief._id);
      await fetchBrief();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish brief');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!brief || !confirm('Are you sure you want to close this campaign brief?')) return;
    try {
      setActionLoading(true);
      await briefApi.closeBrief(brief._id);
      await fetchBrief();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close brief');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!brief) return;
    try {
      setActionLoading(true);
      await briefApi.reopenBrief(brief._id);
      await fetchBrief();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reopen brief');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setActionLoading(true);
      const res = await proposalApi.acceptProposal(proposalId);
      setIsCompareModalOpen(false);
      if (res.project) {
        navigate(`/projects/${res.project._id}`);
      } else {
        await fetchBrief();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept proposal.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Loading campaign brief details...</p>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Brief Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'This brief does not exist or you do not have permission to view it.'}</p>
          <button
            onClick={() => navigate('/briefs')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Briefs
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    closed: 'bg-slate-800 text-slate-400 border-slate-700',
    archived: 'bg-slate-900 text-slate-500 border-slate-800'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <button
          onClick={() => navigate('/briefs')}
          className="mb-6 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaign Briefs
        </button>

        {/* Main Brief Card Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    statusColors[brief.status] || statusColors.draft
                  }`}
                >
                  {brief.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  {brief.category || 'General Campaign'}
                </span>
                {brief.aiMetadata?.isFallback === false && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Co-Created
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">{brief.title}</h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">{brief.summary || brief.description}</p>
            </div>

            {/* Actions Area */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              {/* Creator Action: Submit Proposal */}
              {isCreator && brief.status === 'published' && (
                <button
                  onClick={() => setIsProposalModalOpen(true)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Proposal
                </button>
              )}

              {/* Owner Brand Actions */}
              {isOwner && (
                <>
                  {proposals.length > 0 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4" /> Compare {proposals.length} Proposals
                    </button>
                  )}

                  {brief.status === 'draft' && (
                    <>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Draft
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Publish Brief
                      </button>
                    </>
                  )}

                  {brief.status === 'published' && (
                    <button
                      onClick={handleClose}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Close Campaign
                    </button>
                  )}

                  {brief.status === 'closed' && (
                    <button
                      onClick={handleReopen}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Reopen Campaign
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <span className="text-slate-500 text-xs flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Budget
              </span>
              <p className="font-bold text-white text-base">
                {brief.budget?.amount
                  ? `${brief.budget.currency || 'INR'} ${brief.budget.amount.toLocaleString()}`
                  : 'Flexible'}
              </p>
              <span className="text-xs text-slate-400">{brief.budget?.flexibility || 'Fixed'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-xs flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Deadline
              </span>
              <p className="font-semibold text-slate-200 text-sm">
                {brief.deadline
                  ? new Date(brief.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Flexible'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 text-xs flex items-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Deliverables
              </span>
              <p className="font-semibold text-slate-200 text-sm">{brief.deliverables?.length || 0} Assets Required</p>
            </div>

            <div>
              <span className="text-slate-500 text-xs flex items-center gap-1 mb-1">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> License Terms
              </span>
              <p className="font-semibold text-slate-200 text-sm">{brief.licensingPreferences || 'Commercial Usage'}</p>
            </div>
          </div>
        </div>

        {/* Brand View: Incoming Proposals Section */}
        {isOwner && proposals.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" /> Incoming Creator Proposals ({proposals.length})
              </h2>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Side-by-Side Comparison ↗
              </button>
            </div>

            <div className="space-y-3">
              {proposals.map((prop) => {
                const creator = typeof prop.creatorProfileId === 'object' ? prop.creatorProfileId : null;
                return (
                  <div
                    key={prop._id}
                    className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{creator?.name || 'Creator'}</span>
                        <span className="text-xs text-cyan-400 font-mono">@{creator?.handle}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-cyan-300">
                          {prop.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{prop.title}</p>
                      <span className="text-xs font-semibold text-emerald-400">
                        {prop.currency} {prop.proposedBudget?.toLocaleString()} — {prop.proposedTimeline}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptProposal(prop._id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Accept & Hire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Brand View: Explainable AI Creator Matches Section */}
        {isOwner && matches.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Explainable AI Recommended Creators ({matches.length})
            </h2>

            <div className="space-y-4">
              {matches.slice(0, 3).map(({ creator, match }, i) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {creator.name?.[0] || 'C'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{creator.name}</h4>
                        <span className="text-xs text-cyan-400 font-mono">@{creator.handle}</span>
                      </div>
                    </div>
                    <Link
                      to={`/creator/${creator.handle}`}
                      className="text-xs text-slate-300 hover:text-cyan-400 border border-slate-700 px-3 py-1 rounded-lg bg-slate-800"
                    >
                      View DNA Profile
                    </Link>
                  </div>

                  <MatchScoreCard match={match} compact={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Objective & Audience */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" /> Campaign Objective & Audience
              </h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Core Objective</h4>
                  <p className="leading-relaxed">{brief.objective || brief.summary}</p>
                </div>

                {brief.targetAudience && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Audience</h4>
                    <p className="leading-relaxed">{brief.targetAudience}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Creative Direction & Time Machine */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400" /> Creative Direction
              </h2>

              {brief.selectedDirection && (
                <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" /> Creative Time Machine Selected Direction
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{brief.selectedDirection.directionName}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">{brief.selectedDirection.concept}</p>
                </div>
              )}
            </div>

            {/* Required Deliverables */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> Required Deliverables ({brief.deliverables?.length || 0})
              </h2>

              {brief.deliverables && brief.deliverables.length > 0 ? (
                <div className="space-y-4">
                  {brief.deliverables.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-slate-100">{item.description}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No specific deliverable items detailed.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileCheck className="w-4 h-4 text-cyan-400" /> Rights & Terms
              </h2>

              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block mb-0.5">Licensing Terms</span>
                  <p className="font-semibold text-slate-200">{brief.licensingPreferences || 'Commercial Rights'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditModalOpen && (
        <BriefFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          briefToEdit={brief}
          onSuccess={() => fetchBrief()}
        />
      )}

      {/* Proposal Submission Modal */}
      {isProposalModalOpen && (
        <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          brief={brief}
          onSuccess={() => fetchBrief()}
        />
      )}

      {/* Side-by-Side Proposal Comparison Modal */}
      {isCompareModalOpen && (
        <ProposalComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          proposals={proposals}
          onAccept={handleAcceptProposal}
        />
      )}
    </div>
  );
};

export default BriefDetailPage;
