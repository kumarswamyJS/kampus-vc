import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Building2, Cpu, Zap, Shield, ArrowRight } from 'lucide-react';

export const BrandsPage: React.FC = () => {
  return (
    <div className="pb-20">
      <PageHeader
        badge="For Visionary Brands"
        title="10x Faster Creative Campaigns With AI Visionaries"
        description="Replace months of traditional agency turnaround with explainable AI creator matching and automated campaign briefs."
        actions={
          <Link to="/signup?type=brand">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Post Campaign Brief
            </Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card glow className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Explainable Style Matching</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Match your brand brief to AI creators using quantitative visual aesthetic vectors, color harmony, and motion style algorithms.
            </p>
          </Card>

          <Card glow className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center text-electric-blue">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Brief Generator</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Generate structured creative briefs with automated moodboard expansion, aspect ratio specs, and target audience persona mapping.
            </p>
          </Card>

          <Card glow className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Asset Lineage</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ensure authentic creator output backed by Creative Time Machine prompt seed verification and escrow milestone releases.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
