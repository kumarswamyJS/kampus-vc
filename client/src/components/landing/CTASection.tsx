import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-radial-gradient">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="glass-panel rounded-3xl p-10 sm:p-16 border border-brand-500/30 shadow-glow-cyan relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              The Future of AI Visual Storytelling
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Shape the Next Generation of <span className="text-gradient-neon">AI Campaigns?</span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              Join Kampus.VC today. Whether you are an AI artist creating revolutionary visuals or a brand seeking cutting-edge creative direction.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup?type=brand">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Post a Campaign Brief
                </Button>
              </Link>
              <Link to="/signup?type=creator">
                <Button variant="secondary" size="lg">
                  Join as an AI Creator
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
