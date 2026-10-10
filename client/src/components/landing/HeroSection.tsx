import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Wand2, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-hero-glow">
      
      {/* Background Ambient Glow Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action CTAs */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2">
              <Badge variant="neon" className="py-1 px-3">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
                The AI Creator Marketplace
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] font-sans">
              Connect Visionary <span className="text-gradient-neon">Brands</span> With Elite <span className="text-gradient-neon">AI Creators</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Discover verified AI visual artists, filmmakers, animators, and digital designers. Driven by explainable visual style matching, Creative DNA Passports, and AI-assisted campaign briefs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/explore" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Find a Creator
                </Button>
              </Link>
              <Link to="/signup?type=creator" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={<Wand2 className="w-5 h-5 text-brand-400" />}>
                  Showcase Your Work
                </Button>
              </Link>
            </div>

            {/* Micro Feature Bullet Points */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
                  <Cpu className="w-4 h-4 text-brand-400" /> Style Analysis
                </div>
                <p className="text-[11px] text-slate-400">Multimodal vector matching</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-electric-blue" /> Verified DNA
                </div>
                <p className="text-[11px] text-slate-400">Proven tool mastery</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
                  <Wand2 className="w-4 h-4 text-emerald-400" /> Smart Briefs
                </div>
                <p className="text-[11px] text-slate-400">Instant AI direction</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Portfolio Visual Showcase Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Outer Decorative Glow Ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500 to-electric-blue opacity-30 blur-xl animate-pulse-glow" />

              {/* Main Visual Showcase Box */}
              <div className="relative glass-panel rounded-3xl overflow-hidden border border-white/15 p-3 shadow-2xl">
                
                {/* Generated High-Res Artwork Image */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-dark-900">
                  <img
                    src="/assets/hero_showcase.jpg"
                    alt="Kampus.VC AI Art Showcase"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />

                  {/* Floating Metadata Card Over Artwork */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 glass-panel rounded-xl border border-white/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs">
                        98%
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          Style Match Breakdown
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Cyberpunk • Gen-3 Video • ComfyUI
                        </div>
                      </div>
                    </div>
                    <Badge variant="neon" size="sm">Verified DNA</Badge>
                  </div>
                </div>

                {/* Secondary Decorative UI Strip */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-dark-900/80 rounded-xl border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-300">Live Matching Engine Active</span>
                  </div>
                  <div className="p-2.5 bg-dark-900/80 rounded-xl border border-white/5 flex items-center justify-between text-slate-400">
                    <span>Aesthetic Vector Space</span>
                    <span className="text-brand-400 font-mono">v1.0</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
