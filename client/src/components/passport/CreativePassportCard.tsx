import React from 'react';
import { Sparkles, Dna, ShieldCheck, Cpu, Palette, CheckCircle2, Layers } from 'lucide-react';

interface CreativePassportProps {
  passport: any;
  reliability?: any;
  isOwner?: boolean;
  onReanalyze?: () => void;
}

export const CreativePassportCard: React.FC<CreativePassportProps> = ({
  passport,
  reliability,
  isOwner,
  onReanalyze,
}) => {
  if (!passport) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Dna size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Creative DNA Passport
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Verified System Profile
              </span>
            </h3>
            <p className="text-xs text-slate-400">Explainable creator identity derived from verified portfolio metadata</p>
          </div>
        </div>

        {isOwner && onReanalyze && (
          <button
            onClick={onReanalyze}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles size={14} /> Re-analyze Passport
          </button>
        )}
      </div>

      {/* Completeness Bar */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <ShieldCheck size={14} className="text-cyan-400" /> Passport Completeness
          </span>
          <span className="font-bold text-cyan-400 font-mono">{passport.completenessScore || 80}%</span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${passport.completenessScore || 80}%` }}
          />
        </div>
      </div>

      {/* Identity Summary */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Creative Identity Statement</h4>
        <p className="text-xs text-slate-200 leading-relaxed italic">"{passport.identityStatement}"</p>
      </div>

      {/* Specialties & Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Categories & Visual Styles */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Palette size={15} className="text-cyan-400" /> Primary Specialties & Visual Styles
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {passport.primaryCategories?.map((cat: string) => (
              <span key={cat} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium">
                ★ {cat}
              </span>
            ))}
            {passport.preferredVisualStyles?.map((style: string) => (
              <span key={style} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                {style}
              </span>
            ))}
          </div>
        </div>

        {/* Production Capabilities & AI Tools */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Cpu size={15} className="text-cyan-400" /> AI Tools & Production Pipeline
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {passport.productionTools?.map((tool: string) => (
              <span key={tool} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-[11px] font-mono">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Provenance Evidence Badges */}
      <div className="pt-2">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Verified Provenance Signals</h4>
        <div className="space-y-2">
          {passport.provenanceEvidence?.map((ev: any, idx: number) => (
            <div key={idx} className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg text-xs flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> {ev.attributeName}
              </span>
              <span className="text-[10px] text-slate-400">{ev.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
