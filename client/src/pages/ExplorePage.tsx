import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Avatar } from '../components/ui/Avatar';
import { Dialog } from '../components/ui/Dialog';
import { Search, Filter, Star, CheckCircle, ArrowUpRight, Cpu } from 'lucide-react';
import { DEMO_CREATORS } from '../components/landing/CreatorPreviewSection';
import { CreatorProfile } from '../types';

export const ExplorePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('All');
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);

  const toolsList = ['All', 'Runway Gen-3', 'Midjourney v6', 'ComfyUI', 'Sora', 'Stable Diffusion XL', 'Flux.1'];

  const filteredCreators = DEMO_CREATORS.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creator.specialty && creator.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (creator.bio && creator.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTool =
      selectedTool === 'All' || creator.aiTools.some((t) => t.toLowerCase() === selectedTool.toLowerCase());

    return matchesSearch && matchesTool;
  });

  return (
    <div className="pb-20">
      <PageHeader
        badge="Creator Directory"
        title="Explore Verified AI Talent"
        description="Search creators by visual aesthetic, tool proficiency, and explainable AI match scores."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Search & Tool Filter Controls */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="Search creators by name, skill, or keyword..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {toolsList.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`text-xs px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                  selectedTool === tool
                    ? 'bg-brand-500/20 border-brand-500/60 text-brand-300 font-semibold'
                    : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        {filteredCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={creator.avatarUrl} name={creator.name} verified={creator.verified} size="lg" />
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                          {creator.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">{creator.handle}</p>
                      </div>
                    </div>
                    <Badge variant="neon" size="sm">
                      {creator.matchScore}% Match
                    </Badge>
                  </div>

                  {creator.portfolioSamples[0] && (
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-dark-950 border border-white/5">
                      <img
                        src={creator.portfolioSamples[0].imageUrl}
                        alt={creator.portfolioSamples[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-brand-400 block">{creator.specialty}</span>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{creator.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {creator.aiTools.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-dark-900 text-slate-300 border border-white/5 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {creator.rating}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCreator(creator)}
                    rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    View DNA Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Creators Match Filter"
            description="Try searching with a different AI tool filter or key term."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTool('All');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        )}
      </div>

      {/* Creator Detail DNA Modal */}
      {selectedCreator && (
        <Dialog
          isOpen={!!selectedCreator}
          onClose={() => setSelectedCreator(null)}
          title={`${selectedCreator.name} — Creative DNA Passport`}
          description="Verified tool pipeline, aesthetic vectors, and match scoring details."
        >
          <div className="space-y-4">
            <div className="p-4 bg-dark-900 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Match Score</span>
                <span className="text-brand-400 font-bold">{selectedCreator.matchScore}% Match</span>
              </div>
              <div className="w-full bg-dark-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-brand-500 to-electric-blue h-full"
                  style={{ width: `${selectedCreator.matchScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Visual Match Breakdown</h4>
              <ul className="space-y-1 text-xs text-slate-400">
                {selectedCreator.matchReasons?.map((reason: string) => (
                  <li key={reason} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-400" /> {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCreator(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm">
                Request Proposal
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
