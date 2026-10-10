import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Sparkles, Check, Wand2, Layers, Cpu, Compass } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { CreativeDirection } from '../../types';

export interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDirection: (direction: CreativeDirection) => void;
  initialConcept?: string;
  category?: string;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  onSelectDirection,
  initialConcept = '',
  category = 'Tech & Digital',
}) => {
  const [conceptInput, setConceptInput] = useState(initialConcept);
  const [directions, setDirections] = useState<CreativeDirection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!conceptInput.trim()) return;
    setLoading(true);
    try {
      const data = await apiClient.generateTimeMachineDirections({
        conceptIdea: conceptInput,
        category,
      });
      setDirections(data || []);
      if (data && data.length > 0) {
        setSelectedId(data[0].id || 'direction-1');
      }
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const chosen = directions.find((d) => (d.id || d.directionName) === selectedId) || directions[0];
    if (chosen) {
      onSelectDirection(chosen);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Creative Time Machine — Concept Explorer"
      description="Explore alternative creative directions side by side before finalizing your campaign brief."
    >
      <div className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-2">
        
        {/* Concept Input Banner */}
        <div className="p-4 bg-dark-900/90 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campaign Concept Seed</h4>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. Next-gen wireless earbuds with generative liquid acoustic visuals"
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={loading}
              onClick={handleGenerate}
              leftIcon={<Wand2 className="w-4 h-4" />}
            >
              Explore Directions
            </Button>
          </div>
        </div>

        {/* Directions Grid / Side-by-Side Cards */}
        {directions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-electric-blue" /> Select Creative Direction ({directions.length} Alternative Concepts)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {directions.map((dir) => {
                const idKey = dir.id || dir.directionName;
                const isSelected = selectedId === idKey;
                return (
                  <div
                    key={idKey}
                    onClick={() => setSelectedId(idKey)}
                    className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-glow-cyan'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={isSelected ? 'neon' : 'slate'} size="sm">
                          {dir.directionName}
                        </Badge>
                        {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">{dir.concept}</p>

                      <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                        <span className="text-slate-400 block font-mono">Palette Swatches</span>
                        <div className="flex items-center gap-1">
                          {dir.palette?.map((hex) => (
                            <div
                              key={hex}
                              className="w-5 h-5 rounded-md border border-white/20"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div><strong className="text-slate-400">Lighting:</strong> {dir.lighting}</div>
                        <div><strong className="text-slate-400">Composition:</strong> {dir.composition}</div>
                        <div><strong className="text-slate-400">Impact:</strong> {dir.audienceImpact}</div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full justify-center"
                      onClick={(e) => { e.stopPropagation(); setSelectedId(idKey); }}
                    >
                      {isSelected ? 'Selected' : 'Choose Direction'}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleApply} leftIcon={<Check className="w-4 h-4" />}>
                Apply Direction to Campaign Brief
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
            <p>Enter your campaign seed concept above and click <strong>"Explore Directions"</strong> to launch Creative Time Machine.</p>
          </div>
        )}

      </div>
    </Dialog>
  );
};
