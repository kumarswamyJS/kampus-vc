import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { Dialog } from '../../components/ui/Dialog';
import { PortfolioFormModal } from '../../components/portfolio/PortfolioFormModal';
import { PortfolioDetailModal } from '../../components/portfolio/PortfolioDetailModal';
import { apiClient } from '../../services/apiClient';
import { CreatorProfile, PortfolioItem } from '../../types';
import {
  Sparkles,
  Wand2,
  FolderPlus,
  ArrowRight,
  Settings,
  MessageSquare,
  Video,
  FileText,
  Briefcase,
  CheckCircle2,
  LogOut,
  Star,
  Trash2,
  Edit,
  Eye,
  Lock,
} from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const { user, profile, completionScore, logout } = useAuth();
  const creator = profile as CreatorProfile | null;

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PortfolioItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<PortfolioItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyPortfolioItems();
      setItems(data || []);
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await apiClient.deletePortfolioItem(itemToDelete._id);
      setItemToDelete(null);
      await fetchPortfolio();
    } catch (err) {
      // Handle delete error
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeature = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.toggleFeatureItem(id);
      await fetchPortfolio();
    } catch (err) {
      // Handle error
    }
  };

  const filteredItems = filterCategory === 'All'
    ? items
    : items.filter((i) => i.category === filterCategory);

  return (
    <div className="pb-20">
      {/* Top Banner */}
      <div className="py-10 bg-radial-gradient border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={user?.displayName || 'Creator'} size="xl" verified={user?.isVerified} />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="neon">AI Creator Studio</Badge>
                  {creator?.handle && (
                    <Link to={`/creator/${creator.handle}`} className="text-xs font-mono text-brand-400 hover:underline">
                      @{creator.handle} ↗
                    </Link>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold text-white mt-1">
                  Welcome back, {user?.displayName || 'Creator'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {creator?.handle && (
                <Link to={`/creator/${creator.handle}`}>
                  <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                    View Public DNA Profile
                  </Button>
                </Link>
              )}
              <Link to="/onboarding/creator">
                <Button variant="secondary" size="sm" leftIcon={<Wand2 className="w-4 h-4" />}>
                  Edit Profile
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
        <Card className="p-6 border border-brand-500/30 bg-brand-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Creative DNA Passport Completion</h3>
              </div>
              <p className="text-xs text-slate-300">
                Complete your specializations and portfolio intro to appear higher in explainable AI search results.
              </p>
              <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/10 mt-2">
                <div
                  className="bg-gradient-to-r from-brand-500 to-electric-blue h-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-brand-300 font-mono">{completionScore}%</span>
              <Link to="/onboarding/creator">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
          <Button variant="secondary" size="sm" leftIcon={<Wand2 className="w-4 h-4 text-brand-400" />}>
            Studio Overview
          </Button>
          <Link to="/briefs">
            <Button variant="ghost" size="sm" leftIcon={<FileText className="w-4 h-4 text-cyan-400" />}>
              Explore Briefs <Badge variant="neon" size="sm" className="ml-1">Active</Badge>
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="ghost" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              Projects <Badge variant="slate" size="sm" className="ml-1">Phase 5</Badge>
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

        {/* Portfolio Studio Header & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              Portfolio Studio
              <Badge variant="slate" className="font-mono">{items.length} Artworks</Badge>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage, feature, and upload your high-resolution AI renders.</p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => { setItemToEdit(null); setIsFormModalOpen(true); }}
            leftIcon={<FolderPlus className="w-4 h-4" />}
          >
            Add Portfolio Artwork
          </Button>
        </div>

        {/* Portfolio Items Grid / Gallery */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading portfolio studio...</div>
        ) : filteredItems.length > 0 ? (
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
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <Badge variant="neon" size="sm">{item.category}</Badge>
                      {item.visibility !== 'public' && (
                        <Badge variant="slate" size="sm" className="gap-1">
                          <Lock className="w-3 h-3" /> {item.visibility}
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleToggleFeature(item._id, e)}
                      title={item.isFeatured ? 'Unfeature' : 'Mark as Featured'}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
                        item.isFeatured
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-dark-950/70 border-white/10 text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <div className="px-4 space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>}
                  </div>
                </div>

                <div className="p-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">{item.aiInvolvement}</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setItemToEdit(item); setIsFormModalOpen(true); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Item"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wand2 className="w-8 h-8 text-brand-400" />}
            title="No Portfolio Artworks Yet"
            description="Upload your high-res AI renders or video clips to showcase your visual mastery on your public profile."
            action={
              <Button variant="primary" size="sm" onClick={() => { setItemToEdit(null); setIsFormModalOpen(true); }}>
                Add First Portfolio Artwork
              </Button>
            }
          />
        )}

      </div>

      {/* Form Modal */}
      <PortfolioFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchPortfolio}
        itemToEdit={itemToEdit}
      />

      {/* Detail Viewer Modal */}
      <PortfolioDetailModal
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Portfolio Artwork?"
      >
        <div className="space-y-4 text-left text-xs text-slate-300">
          <p>Are you sure you want to delete <strong className="text-white">{itemToDelete?.title}</strong>? This will remove the item from your public profile and delete associated stored media files.</p>
          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="danger" size="sm" isLoading={deleting} onClick={handleDelete}>Delete Artwork</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
