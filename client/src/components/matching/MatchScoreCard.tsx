import React, { useState } from 'react';
import { CreatorMatchResult } from '../../types';
import { Sparkles, CheckCircle, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MatchScoreCardProps {
  match: CreatorMatchResult;
  compact?: boolean;
}

export const MatchScoreCard: React.FC<MatchScoreCardProps> = ({ match, compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);

  // Score color badge
  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (score >= 70) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition-all">
      {/* Score Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadge(match.overallScore)}`}>
                {match.overallScore}% Match
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {match.dataCoverage}% Data Coverage
              </span>
            </div>
            <h4 className="text-xs font-semibold text-slate-300 mt-1">Explainable AI Creator Compatibility</h4>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <span>{expanded ? 'Hide Breakdown' : 'View Breakdown'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded 7-Dimension Breakdown */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 text-xs">
          {/* Dimension Progress Bars */}
          <div className="space-y-2.5">
            {match.components.map((comp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium flex items-center gap-1.5">
                    {comp.dimension}
                    <span className="text-[10px] text-slate-500 font-mono">({comp.weight}%)</span>
                  </span>
                  <span className="font-bold font-mono text-cyan-400">{comp.score}/100</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
                {comp.reason && <p className="text-[11px] text-slate-400 italic">{comp.reason}</p>}
              </div>
            ))}
          </div>

          {/* Positive Evidence & Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {match.positiveEvidence.length > 0 && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Positive Evidence
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {match.positiveEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-emerald-400">•</span> {ev}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {match.mismatchesAndGaps.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Potential Gaps
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {match.mismatchesAndGaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-400">•</span> {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {match.missingInformation.length > 0 && (
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-1.5 text-[11px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-300">Missing Information: </strong>
                {match.missingInformation.join('; ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchScoreCard;
