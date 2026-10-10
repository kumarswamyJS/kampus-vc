import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Palette, ShieldCheck, Zap, DollarSign, ArrowRight } from 'lucide-react';

export const CreatorsPage: React.FC = () => {
  return (
    <div className="pb-20">
      <PageHeader
        badge="For AI Visual Artists"
        title="Showcase Your Artistry. Earn On Your Terms."
        description="Join Kampus.VC to connect with brands seeking generative AI directors, 3D animators, and visual creators."
        actions={
          <Link to="/signup?type=creator">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Apply as Creator
            </Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card glow className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Creative DNA Passport</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Showcase your exact AI tool pipeline (ComfyUI, Midjourney, Sora, Runway Gen-3) with verified prompt lineage and rendering benchmarks.
            </p>
          </Card>

          <Card glow className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center text-electric-blue">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Guaranteed Escrow</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Funds are deposited in milestone escrow before project kick-off. No delayed client payments or uncompensated revisions.
            </p>
          </Card>

          <Card glow className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Custom IP Licensing</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Maintain full ownership or set clear commercial buyouts, regional AI usage rights, and non-exclusive digital permissions.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
