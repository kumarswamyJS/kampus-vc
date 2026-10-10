import React from 'react';
import { FileText, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: <FileText className="w-6 h-6 text-brand-400" />,
      title: 'Understand the Campaign',
      description:
        'Post your vision or generate an AI-assisted brief specifying deliverable specs, visual aesthetic, color palette, and target AI tool pipelines.',
    },
    {
      number: '02',
      icon: <Cpu className="w-6 h-6 text-electric-blue" />,
      title: 'Discover Compatible Creators',
      description:
        'Our explainable AI visual match engine analyzes multimodal style embeddings to recommend creators with proven Creative DNA and tool mastery.',
    },
    {
      number: '03',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      title: 'Collaborate and Deliver',
      description:
        'Review prompt lineage with Creative Time Machine, collaborate in real-time workspace, and release funds via secure escrow milestones.',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="neon">Streamlined Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How <span className="text-gradient-neon">Kampus.VC</span> Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            From initial creative vision to final high-resolution deliverable asset — simplified in three intelligent steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="glass-panel rounded-2xl p-8 border border-white/10 relative flex flex-col justify-between group hover:border-brand-500/40 transition-all duration-300"
            >
              <div className="space-y-6">
                
                {/* Step Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black font-mono text-slate-700 group-hover:text-brand-500/50 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>

              </div>

              {/* Connecting Step Indicator for Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};
