import React, { useState } from 'react';
import { Star, CheckCircle, Sparkles, Filter, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CreatorProfile } from '../../types';

export const DEMO_CREATORS: CreatorProfile[] = [
  {
    id: 'demo-1',
    name: 'Aria Vance',
    handle: '@aria_synapse',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Pioneering generative AI filmmaking, cinematic world-building, and high-fps neural rendering.',
    specialty: 'Cinematic AI Director',
    specialtyCategory: 'AI Filmmaking',
    aiTools: ['Runway Gen-3', 'Midjourney v6', 'ComfyUI', 'ElevenLabs'],
    portfolioSamples: [
      {
        id: 'p1',
        title: 'Synapse 8K Camera Render',
        imageUrl: '/assets/portfolio_1.jpg',
        category: 'AI Filmmaking',
      },
    ],
    matchScore: 98,
    matchReasons: ['Dominant Dark Aesthetic', 'High Frame Stability', 'Sci-Fi Lighting Expert'],
    rating: 4.98,
    completedCampaigns: 24,
    hourlyRate: '$120/hr',
    verified: true,
    isDemo: true,
  },
  {
    id: 'demo-2',
    name: 'Kaelen Thorne',
    handle: '@kaelen_motion',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: '3D motion design, holographic visual effects, and brand animation powered by AI pipelines.',
    specialty: '3D VFX & Motion Lead',
    specialtyCategory: '3D Animation',
    aiTools: ['Sora', 'Luma Dream Machine', 'Blender AI', 'Unreal Engine 5'],
    portfolioSamples: [
      {
        id: 'p2',
        title: 'Cyberpunk Anime Character',
        imageUrl: '/assets/hero_showcase.jpg',
        category: '3D Animation',
      },
    ],
    matchScore: 95,
    matchReasons: ['Holographic VFX', 'Octane Shader Match', 'Commercial Brand Ready'],
    rating: 4.92,
    completedCampaigns: 18,
    hourlyRate: '$140/hr',
    verified: true,
    isDemo: true,
  },
  {
    id: 'demo-3',
    name: 'Elena Rostova',
    handle: '@elena_synth',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Abstract neural art, surreal hyper-realistic portraits, and luxury fashion campaign visuals.',
    specialty: 'Generative AI Visual Artist',
    specialtyCategory: 'Generative Visuals',
    aiTools: ['Stable Diffusion XL', 'ControlNet', 'Photoshop AI', 'Flux.1'],
    portfolioSamples: [
      {
        id: 'p3',
        title: 'Futuristic Studio Workspace',
        imageUrl: '/assets/portfolio_1.jpg',
        category: 'Generative Visuals',
      },
    ],
    matchScore: 93,
    matchReasons: ['High Contrast Lighting', 'Luxury Brand Styling', 'Custom LoRA Specialist'],
    rating: 4.95,
    completedCampaigns: 31,
    hourlyRate: '$110/hr',
    verified: true,
    isDemo: true,
  },
];

export const CreatorPreviewSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'AI Filmmaking', '3D Animation', 'Generative Visuals'];

  const filteredCreators = selectedCategory === 'All'
    ? DEMO_CREATORS
    : DEMO_CREATORS.filter((c) => c.specialtyCategory === selectedCategory);

  return (
    <section className="py-20 bg-dark-900/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <Badge variant="blue">
                <Sparkles className="w-3.5 h-3.5 text-electric-blue" />
                Featured Creator Showcase
              </Badge>
              <span className="text-xs font-mono text-slate-500 bg-dark-800 px-2.5 py-0.5 rounded-full border border-white/5">
                Demonstration Content
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Verified <span className="text-gradient-neon">AI Visionaries</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Browse top-tier creators rated by visual style analysis, tool mastery, and verified project delivery.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline-block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 font-semibold'
                    : 'bg-dark-800/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/10 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Creator Header Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/15"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                          {creator.name}
                        </h3>
                        {creator.verified && (
                          <span title="Verified AI Creator">
                            <CheckCircle className="w-4 h-4 text-brand-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{creator.handle}</p>
                    </div>
                  </div>
                  <Badge variant="slate" size="sm">
                    {creator.hourlyRate}
                  </Badge>
                </div>

                {/* Portfolio Sample Thumbnail */}
                {creator.portfolioSamples[0] && (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-dark-950 border border-white/5 group-hover:border-brand-500/30 transition-colors">
                    <img
                      src={creator.portfolioSamples[0].imageUrl}
                      alt={creator.portfolioSamples[0].title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="neon" size="sm">
                        {creator.matchScore}% Match
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Specialty & Bio */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider block">
                    {creator.specialty}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {creator.bio}
                  </p>
                </div>

                {/* AI Tools Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {creator.aiTools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-dark-800 text-slate-300 border border-white/5 font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

              </div>

              {/* Card Footer Metrics & Action */}
              <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {creator.rating}
                  </span>
                  <span>•</span>
                  <span>{creator.completedCampaigns} Projects</span>
                </div>

                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                  View DNA
                </Button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
