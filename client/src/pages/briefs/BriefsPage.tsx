import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { briefApi } from '../../services/apiClient';
import { CampaignBrief } from '../../types';
import BriefFormModal from '../../components/briefs/BriefFormModal';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Briefcase,
  Clock,
  DollarSign,
  Layers,
  ChevronRight,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Tag
} from 'lucide-react';

export const BriefsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [briefs, setBriefs] = useState<CampaignBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrief, setEditingBrief] = useState<CampaignBrief | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isBrand = user?.role === 'brand';

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isBrand) {
        // Fetch brand's briefs
        const status = selectedStatus === 'all' ? undefined : selectedStatus;
        const res = await briefApi.getMyBriefs({ status, search: searchQuery || undefined });
        setBriefs(res.data.briefs);
      } else {
        // Fetch published briefs for creators
        const res = await briefApi.getPublishedBriefs({
          search: searchQuery || undefined,
          category: selectedCategory === 'all' ? undefined : selectedCategory
        });
        setBriefs(res.data.briefs);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load campaign briefs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, [selectedStatus, selectedCategory, user?.role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBriefs();
  };

  const handlePublish = async (briefId: string) => {
    try {
      setActionLoading(briefId);
      await briefApi.publishBrief(briefId);
      await fetchBriefs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish brief');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (briefId: string) => {
    if (!confirm('Are you sure you want to close this campaign brief?')) return;
    try {
      setActionLoading(briefId);
      await briefApi.closeBrief(briefId);
      await fetchBriefs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close brief');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusTabChange = (status: string) => {
    setSelectedStatus(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const categories = [
    'all',
    'Commercial & Advertising',
    'Social Media Content',
    '3D & CGI Motion',
    'VFX & Post-Production',
    'Product Animation',
    'AI Visual Art',
    'Brand Identity & Design',
    'Short Film & Cinematic'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-[#00F0FF] text-xs font-semibold tracking-wider uppercase mb-1 items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBrand ? 'Campaign Brief Management' : 'Campaign Brief Discovery'}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {isBrand ? 'Your Campaign Briefs' : 'Explore Open Briefs'}
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              {isBrand
                ? 'Create, manage, AI-generate, and publish high-impact creative briefs for top AI artists and visual creators.'
                : 'Browse active brand campaigns, review deliverable specifications, and discover new creative opportunities.'}
            </p>
          </div>

          {isBrand && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingBrief(null);
                  setIsFormOpen(true);
                }}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Brief</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search briefs by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </form>

          {/* Status Tabs (Brand) or Category Filters (Creator) */}
          {isBrand ? (
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80 w-full md:w-auto overflow-x-auto">
              {['all', 'draft', 'published', 'closed', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusTabChange(status)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Loading campaign briefs...</p>
          </div>
        ) : briefs.length === 0 ? (
          /* Empty State */
          <div className="py-20 px-4 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              {isBrand ? 'No campaign briefs found' : 'No active campaign opportunities'}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              {isBrand
                ? 'Get started by building your first AI-assisted campaign brief to hire top digital creators.'
                : 'Check back soon for new campaign briefs published by top brands.'}
            </p>
            {isBrand && (
              <button
                onClick={() => {
                  setEditingBrief(null);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Your First Brief
              </button>
            )}
          </div>
        ) : (
          /* Brief Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {briefs.map((brief) => {
              const statusColors = {
                draft: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                closed: 'bg-slate-800 text-slate-400 border-slate-700',
                archived: 'bg-slate-900 text-slate-500 border-slate-800'
              };

              return (
                <div
                  key={brief._id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 group"
                >
                  <div>
                    {/* Card Header: Category & Status */}
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        {brief.category || 'General Campaign'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          statusColors[brief.status] || statusColors.draft
                        }`}
                      >
                        {brief.status}
                      </span>
                    </div>

                    {/* Brief Title */}
                    <h3
                      onClick={() => navigate(`/briefs/${brief._id}`)}
                      className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 cursor-pointer transition-colors line-clamp-1 mb-2"
                    >
                      {brief.title}
                    </h3>

                    {/* Brief Summary */}
                    <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                      {brief.summary || brief.description || 'No description provided.'}
                    </p>

                    {/* Key Attributes */}
                    <div className="space-y-2 mb-5 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Budget
                        </span>
                        <span className="font-semibold text-emerald-400">
                          {brief.budget?.amount
                            ? `${brief.budget.currency || 'INR'} ${brief.budget.amount.toLocaleString()}`
                            : 'Flexible / TBD'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline
                        </span>
                        <span>
                          {brief.deadline
                            ? new Date(brief.deadline).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Open ended'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" /> Deliverables
                        </span>
                        <span>{brief.deliverables?.length || 0} items</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2 gap-2 border-t border-slate-800/60">
                    <button
                      onClick={() => navigate(`/briefs/${brief._id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> View Brief
                    </button>

                    {isBrand && (
                      <div className="flex items-center gap-1.5">
                        {brief.status === 'draft' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingBrief(brief);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Edit Brief"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePublish(brief._id)}
                              disabled={actionLoading === brief._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                            </button>
                          </>
                        )}

                        {brief.status === 'published' && (
                          <button
                            onClick={() => handleClose(brief._id)}
                            disabled={actionLoading === brief._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Close Campaign
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brief Creation / Editing Modal */}
      {isFormOpen && (
        <BriefFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          briefToEdit={editingBrief}
          onSuccess={() => {
            fetchBriefs();
          }}
        />
      )}
    </div>
  );
};

export default BriefsPage;
