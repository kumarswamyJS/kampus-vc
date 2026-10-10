import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PortfolioDetailModal } from '../../components/portfolio/PortfolioDetailModal';
import { apiClient } from '../../services/apiClient';
import { CreatorProfile, PortfolioItem } from '../../types';
import {
  Sparkles,
  CheckCircle,
  Wand2,
  Globe,
  Twitter,
  Instagram,
  Star,
  MessageSquare,
  Briefcase,
  Info,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export const PublicCreatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDetailItem, setSelectedDetailItem] = useState<PortfolioItem | null>(null);
  const [showActionModal, setShowActionModal] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPublicData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const creatorData = await apiClient.getPublicCreator(id);
        if (mounted) {
          setCreator(creatorData);
        }
        if (creatorData && creatorData._id) {
          const portfolioData = await apiClient.getPublicPortfolioItems(creatorData._id);
          if (mounted) {
            setItems(portfolioData || []);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setError('Creator profile not found or private.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPublicData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Loading Creative DNA Passport...</p>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="py-20 px-4 max-w-md mx-auto text-center space-y-4">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Creator Not Found</h2>
          <p className="text-xs text-slate-400">The requested creator profile does not exist or has set their profile to private.</p>
          <Link to="/explore">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Creator Directory
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="pb-20">
      
      {/* Header Banner */}
      <div className="py-12 bg-radial-gradient border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            
            {/* Creator Identity */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar src={creator.avatarUrl} name={creator.name} verified={creator.verified} size="xl" />
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neon">Verified AI Visual Director</Badge>
                  <span className="text-xs font-mono text-slate-400">@{creator.handle}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-2">
                  {creator.name}
                  {creator.verified && <CheckCircle className="w-5 h-5 text-brand-400 shrink-0" />}
                </h1>

                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {creator.bio || 'AI creator specializing in cinematic visuals, prompt engineering, and generative video direction.'}
                </p>

                {/* AI Tools & Experience Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {creator.aiTools?.map((tool) => (
                    <span key={tool} className="text-xs px-2.5 py-1 rounded-md bg-dark-900 border border-white/10 font-mono text-brand-300">
                      {tool}
                    </span>
                  ))}
                  <span className="text-xs px-2.5 py-1 rounded-md bg-electric-blue/10 border border-electric-blue/30 font-semibold text-electric-blue">
                    {creator.experienceLevel || 'Intermediate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-3 shrink-0">
              <Badge variant="slate" className="font-mono text-sm py-1.5 px-4">
                Rate: {creator.hourlyRate || '$100/hr'}
              </Badge>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowActionModal(`Hire ${creator.name}`)}
                  leftIcon={<Briefcase className="w-4 h-4" />}
                >
                  Hire Creator
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowActionModal(`Message ${creator.name}`)}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Message
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        
        {/* Creative DNA Passport Section */}
        <Card className="p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Creative DNA Passport</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Creator-Declared Metadata</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Category</span>
              <span className="text-white font-semibold">{creator.specialtyCategory || 'AI Filmmaking'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Rating</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {creator.rating || 5.0} / 5.0
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Completed Projects</span>
              <span className="text-white font-semibold">{creator.completedCampaigns || 0} Delivered</span>
            </div>
            <div>
              <span className="text-slate-400 block">Availability</span>
              <span className="text-emerald-400 font-semibold">{creator.availability || 'Contract'}</span>
            </div>
          </div>
        </Card>

        {/* Gallery Header & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Public Portfolio Showcase</h2>
            <p className="text-xs text-slate-400">Click any artwork to inspect prompt parameters, workflow lineage, and licensing terms.</p>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500/20 border-brand-500/60 text-brand-300 font-semibold'
                      : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Gallery */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedDetailItem(item)}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video bg-dark-950 overflow-hidden">
                    {item.mediaType === 'video' ? (
                      <video src={item.mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant="neon" size="sm">{item.category}</Badge>
                    </div>
                  </div>

                  <div className="px-4 space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>}
                  </div>
                </div>

                <div className="p-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">{item.aiInvolvement}</span>
                  <span className="text-brand-400 font-semibold hover:underline">View DNA ↗</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wand2 className="w-8 h-8 text-brand-400" />}
            title="No Public Artworks Published Yet"
            description="This creator has not published any public portfolio items yet."
          />
        )}

      </div>

      {/* Portfolio Detail Viewer Modal */}
      <PortfolioDetailModal
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem}
      />

      {/* Direct Messaging / Hire Coming Soon Modal */}
      <Dialog
        isOpen={!!showActionModal}
        onClose={() => setShowActionModal(null)}
        title={showActionModal || 'Action Requested'}
      >
        <div className="space-y-4 text-left text-xs text-slate-300">
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-start gap-2 text-brand-300">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <span>
              Real-time messaging, WebRTC calling, and direct proposal submission will activate in <strong>Phase 4 & Phase 5</strong>.
            </span>
          </div>
          <p>You can currently explore creators' verified portfolio DNA and visual styles.</p>
          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowActionModal(null)}>
              Got It
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
