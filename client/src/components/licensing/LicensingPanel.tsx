import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LicensingPanelProps {
  analysis: any;
}

export const LicensingPanel: React.FC<LicensingPanelProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="text-cyan-400" size={20} />
          <h4 className="font-bold text-white text-sm">Contract Usage & Licensing Analysis</h4>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          AI Contract Intelligence
        </span>
      </div>

      <p className="text-slate-300 text-xs italic">{analysis.summary}</p>

      {/* Identified Conflicts */}
      {analysis.identifiedConflicts && analysis.identifiedConflicts.length > 0 && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1 text-rose-300">
          <span className="font-bold flex items-center gap-1 text-rose-400">
            <AlertTriangle size={14} /> Agreement Conflicts Identified
          </span>
          {analysis.identifiedConflicts.map((c: string, idx: number) => (
            <p key={idx} className="text-[11px]">• {c}</p>
          ))}
        </div>
      )}

      {/* Terms Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
          <span className="text-slate-400">Commercial Usage:</span>
          <span className="font-bold text-emerald-400">{analysis.commercialUsage}</span>
        </div>
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
          <span className="text-slate-400">Exclusivity:</span>
          <span className="font-bold text-cyan-400">{analysis.exclusivity}</span>
        </div>
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
          <span className="text-slate-400">Duration:</span>
          <span className="font-bold text-white">{analysis.duration}</span>
        </div>
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
          <span className="text-slate-400">Paid Ad Rights:</span>
          <span className="font-bold text-emerald-400">Permitted</span>
        </div>
      </div>
    </div>
  );
};
