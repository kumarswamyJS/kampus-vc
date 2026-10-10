import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { briefApi } from '../../services/apiClient';
import { CampaignBrief, BrandProfile } from '../../types';
import {
  Building2,
  PlusCircle,
  ArrowRight,
  Settings,
  MessageSquare,
  Video,
  FileText,
  Briefcase,
  Search,
  LogOut,
  Globe,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const BrandDashboard: React.FC = () => {
  const { user, profile, completionScore, logout } = useAuth();
  const brand = profile as BrandProfile | null;

  const [briefs, setBriefs] = useState<CampaignBrief[]>([]);
  const [loadingBriefs, setLoadingBriefs] = useState(true);

  useEffect(() => {
    const loadBriefs = async () => {
      try {
        setLoadingBriefs(true);
        const res = await briefApi.getMyBriefs();
        setBriefs(res.data.briefs || []);
      } catch (err) {
        console.error('Failed to load brand briefs', err);
      } finally {
        setLoadingBriefs(false);
      }
    };
    loadBriefs();
  }, []);

  const draftCount = briefs.filter((b) => b.status === 'draft').length;
  const publishedCount = briefs.filter((b) => b.status === 'published').length;
  const closedCount = briefs.filter((b) => b.status === 'closed').length;

  return (
    <div className="pb-20">
      {/* Top Banner */}
      <div className="py-10 bg-radial-gradient border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={brand?.companyName || user?.displayName || 'Brand'} size="xl" verified={user?.isVerified} />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="blue">Brand Campaign Manager</Badge>
                  {brand?.industry && <span className="text-xs font-mono text-slate-400">{brand.industry}</span>}
                </div>
                <h1 className="text-3xl font-extrabold text-white mt-1">
                  {brand?.companyName || user?.displayName || 'Brand Portal'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/onboarding/brand">
                <Button variant="outline" size="sm" leftIcon={<Building2 className="w-4 h-4" />}>
                  Edit Brand Identity
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Completion Progress Alert Banner */}
        <Card className="p-6 border border-electric-blue/30 bg-electric-blue/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-electric-blue" />
                <h3 className="text-sm font-bold text-white">Brand Profile Completion</h3>
              </div>
              <p className="text-xs text-slate-300">
                Complete your target audience details and preferred visual styles to receive tailored AI creator recommendations.
              </p>
              <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/10 mt-2">
                <div
                  className="bg-gradient-to-r from-electric-blue to-brand-500 h-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-electric-blue font-mono">{completionScore}%</span>
              <Link to="/onboarding/brand">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Campaign Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Briefs</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{briefs.length}</p>
          </Card>

          <Card className="p-4 border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Published Briefs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">{publishedCount}</p>
          </Card>

          <Card className="p-4 border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Draft Briefs</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-2">{draftCount}</p>
          </Card>

          <Card className="p-4 border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Closed Briefs</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-300 mt-2">{closedCount}</p>
          </Card>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
          <Button variant="secondary" size="sm" leftIcon={<Building2 className="w-4 h-4 text-electric-blue" />}>
            Overview
          </Button>
          <Link to="/explore">
            <Button variant="ghost" size="sm" leftIcon={<Search className="w-4 h-4" />}>
              Discover Creators
            </Button>
          </Link>
          <Link to="/briefs">
            <Button variant="ghost" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
              Campaign Briefs <Badge variant="blue" size="sm" className="ml-1">Active</Badge>
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="ghost" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              Escrow Projects <Badge variant="slate" size="sm" className="ml-1">Phase 5</Badge>
            </Button>
          </Link>
          <Link to="/messages">
            <Button variant="ghost" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
              Messages <Badge variant="slate" size="sm" className="ml-1">Phase 4</Badge>
            </Button>
          </Link>
          <Link to="/calls">
            <Button variant="ghost" size="sm" leftIcon={<Video className="w-4 h-4" />}>
              Video Calls <Badge variant="slate" size="sm" className="ml-1">Phase 4</Badge>
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
              Settings
            </Button>
          </Link>
        </div>

        {/* Main Grid: Brand Summary & Active Briefs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Brand Identity Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card glow className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-electric-blue" />
                Brand Identity Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Industry</span>
                  <span className="text-white font-semibold">{brand?.industry || 'Digital Technology'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Website</span>
                  {brand?.website ? (
                    <a href={brand.website} target="_blank" rel="noreferrer" className="text-brand-400 underline">
                      {brand.website}
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">Not set</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">Target Audience Persona</span>
                  <span className="text-slate-200">{brand?.targetAudience || 'Not specified yet'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Typical Campaign Budget</span>
                  <span className="text-white font-semibold">{brand?.typicalCampaignBudget || 'INR 50,000 - 200,000'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <Link to="/onboarding/brand">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Update Brand Profile
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Right Column: Campaign Briefs Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Campaign Briefs</h3>
                <p className="text-xs text-slate-400">Manage campaign requirements and match with compatible AI visual directors.</p>
              </div>
              <Link to="/briefs">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Create / Manage Briefs
                </Button>
              </Link>
            </div>

            {loadingBriefs ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading campaign briefs...</div>
            ) : briefs.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8 text-electric-blue" />}
                title="No Active Campaign Briefs"
                description="Create an AI-assisted campaign brief to generate visual moodboards and receive proposals from verified creators."
                action={
                  <Link to="/briefs">
                    <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                      Create AI Brief
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {briefs.slice(0, 4).map((brief) => (
                  <Link
                    key={brief._id}
                    to={`/briefs/${brief._id}`}
                    className="block bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all hover:bg-slate-900/80"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{brief.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                        {brief.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{brief.summary || brief.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Budget:{' '}
                        <strong className="text-emerald-400">
                          {brief.budget?.amount ? `${brief.budget.currency || 'INR'} ${brief.budget.amount.toLocaleString()}` : 'Flexible'}
                        </strong>
                      </span>
                      <span>{brief.deliverables?.length || 0} deliverables</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;

