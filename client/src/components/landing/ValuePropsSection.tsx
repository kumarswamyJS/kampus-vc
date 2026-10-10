import React, { useState } from 'react';
import { Palette, Building2, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ValuePropsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'creators' | 'brands'>('creators');

  const creatorBenefits = [
    { title: 'Monetize Your AI Artistry', desc: 'Connect with top brands seeking your specific visual style and tool expertise.' },
    { title: 'Build Your Creative DNA Passport', desc: 'Stand out with verified tool proficiencies (ComfyUI, Runway, Sora) and prompt lineage.' },
    { title: 'Zero Friction Escrow Payments', desc: 'Never worry about unpaid invoices. Funds are locked upfront in milestone escrow.' },
    { title: 'Retain Clear IP & Rights Control', desc: 'Choose exact licensing terms (Commercial Buyout, Limited Digital, Regional).' },
  ];

  const brandBenefits = [
    { title: 'Cut Production Lead Times by 10x', desc: 'Hire top generative AI visual directors ready to execute in days, not months.' },
    { title: 'Explainable Style Match Scores', desc: 'Eliminate guesswork with quantitative visual similarity and color palette matching.' },
    { title: 'Verified Creator Authenticity', desc: 'Avoid unvetted renders. Ensure proof of prompt seed parameters and generation lineage.' },
    { title: 'Escrow Milestone Guarantee', desc: 'Funds are only released when custom deliverables meet exact project acceptance criteria.' },
  ];

  return (
    <section className="py-20 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="neon">Dual Marketplace Ecosystem</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built For <span className="text-gradient-neon">Creators</span> & Visionary <span className="text-gradient-neon">Brands</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Empowering AI visual artists while offering agencies unprecedented creative execution speed.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-12">
          <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-2 border border-white/10">
            <button
              onClick={() => setActiveTab('creators')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'creators'
                  ? 'bg-gradient-to-r from-brand-500 to-electric-blue text-dark-950 shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" /> For AI Creators
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'brands'
                  ? 'bg-gradient-to-r from-brand-500 to-electric-blue text-dark-950 shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> For Brands & Agencies
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-6">
              <Badge variant={activeTab === 'creators' ? 'neon' : 'blue'}>
                {activeTab === 'creators' ? 'Creator Benefits' : 'Brand Advantages'}
              </Badge>
              
              <h3 className="text-2xl font-extrabold text-white">
                {activeTab === 'creators'
                  ? 'Elevate Your AI Creative Career'
                  : 'Accelerate Your Creative Production'}
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeTab === 'creators'
                  ? 'Join an exclusive network of vetted AI visual artists, animators, and filmmakers. Get matched with high-paying brand campaigns.'
                  : 'Access global AI talent specialized in cinematic video, 3D motion graphics, and generative brand visuals with guaranteed milestone protection.'}
              </p>

              <Link to={activeTab === 'creators' ? '/signup?type=creator' : '/signup?type=brand'}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {activeTab === 'creators' ? 'Apply as a Creator' : 'Post a Campaign Brief'}
                </Button>
              </Link>
            </div>

            {/* Benefits Checklist */}
            <div className="space-y-4 bg-dark-900/90 p-6 rounded-2xl border border-white/5">
              {(activeTab === 'creators' ? creatorBenefits : brandBenefits).map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
