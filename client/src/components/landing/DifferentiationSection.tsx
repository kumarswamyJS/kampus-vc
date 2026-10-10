import React from 'react';
import { Cpu, ShieldCheck, Sparkles, History, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const DifferentiationSection: React.FC = () => {
  const pillars = [
    {
      icon: <Cpu className="w-6 h-6 text-brand-400" />,
      title: 'Explainable AI Matching',
      description:
        'Instead of opaque black-box recommendations, see exactly why a creator matches your brief (Aesthetic Vector Similarity, Motion Stability, Color Palette Alignment).',
      features: ['Multimodal style embedding analysis', 'Quantitative visual score breakdown', 'Custom brand palette matching'],
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-electric-blue" />,
      title: 'Creative DNA Passport',
      description:
        'A verifiable digital credential documenting verified AI tool proficiencies (ComfyUI, Midjourney, Sora, Runway), turnaround history, and client reliability metrics.',
      features: ['Verified tool pipeline credentials', 'On-time milestone delivery score', 'Authentic portfolio verification'],
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      title: 'AI-Assisted Campaign Briefs',
      description:
        'Transform rough ideas into production-ready creative briefs with automated moodboards, prompt parameters, aspect ratio specs, and deliverable guidelines.',
      features: ['Automated prompt expansion', 'Interactive visual moodboards', 'Technical deliverable specs'],
    },
    {
      icon: <History className="w-6 h-6 text-purple-400" />,
      title: 'Evidence-Backed Verification',
      description:
        'Prevent stolen artwork or fake profiles. Creators demonstrate prompt lineage and seed parameters through our Creative Time Machine transparency suite.',
      features: ['Prompt lineage tracking', 'Generation seed verification', 'Dispute-free escrow milestones'],
    },
  ];

  return (
    <section className="py-20 bg-dark-900/80 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="blue">Proprietary Technology</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why <span className="text-gradient-neon">Kampus.VC</span> Stands Apart
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Built specifically for the generative AI era. Replacing generic freelance listings with explainable visual intelligence and verifiable creator credentials.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar) => (
            <Card key={pillar.title} glow className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                  <span className="text-xs text-brand-400 font-mono">Kampus.VC Core Feature</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">{pillar.description}</p>

              <div className="pt-3 border-t border-white/10 space-y-2">
                {pillar.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 text-[10px]">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};
