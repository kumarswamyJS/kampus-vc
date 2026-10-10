import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiClient } from '../../services/apiClient';
import { BrandProfile } from '../../types';
import {
  Building2,
  Globe,
  CheckCircle,
  FileText,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PublicBrandProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchBrand = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getPublicBrand(id);
        if (mounted) setBrand(data);
      } catch (err) {
        if (mounted) setError('Brand profile not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBrand();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Loading Brand Profile...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="py-20 px-4 max-w-md mx-auto text-center space-y-4">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Brand Not Found</h2>
          <p className="text-xs text-slate-400">The requested brand profile does not exist.</p>
          <Link to="/brands">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Brands Solutions
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20">
      
      {/* Top Banner */}
      <div className="py-12 bg-radial-gradient border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <Avatar name={brand.companyName} size="xl" verified={brand.verified} />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{brand.industry || 'Digital Technology'}</Badge>
                </div>

                <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                  {brand.companyName}
                  {brand.verified && <CheckCircle className="w-5 h-5 text-electric-blue" />}
                </h1>

                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <Globe className="w-3.5 h-3.5" /> {brand.website}
                  </a>
                )}
              </div>
            </div>

            <Badge variant="slate" className="font-mono text-xs py-1.5 px-3">
              Budget: {brand.typicalCampaignBudget || '$5,000 - $25,000'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        
        {/* Brand Overview & Identity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-4 border border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-electric-blue" />
                About {brand.companyName}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {brand.description || 'This brand has not published a detailed description yet.'}
              </p>
            </Card>

            <Card className="p-6 space-y-4 border border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                Visual Styles & Target Persona
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Target Audience</span>
                  <p className="text-white font-medium">{brand.targetAudience || 'Not specified'}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card glow className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electric-blue" />
                Brand Campaign Portal
              </h3>
              <p className="text-xs text-slate-300">
                Brands on Kampus.VC connect directly with AI creators to launch generative video and visual campaigns.
              </p>
              <Link to="/explore">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  Explore Compatible AI Creators
                </Button>
              </Link>
            </Card>
          </div>

        </div>

        {/* Campaign Briefs Empty State */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Public Campaign Briefs</h3>
          <EmptyState
            icon={<FileText className="w-8 h-8 text-electric-blue" />}
            title="No Active Public Briefs"
            description="This brand does not currently have any active public briefs."
          />
        </div>

      </div>
    </div>
  );
};
