import React from 'react';
import { ShieldCheck, Award, Clock, AlertCircle } from 'lucide-react';

interface ReliabilityBadgeProps {
  reliability: any;
}

export const ReliabilityBadge: React.FC<ReliabilityBadgeProps> = ({ reliability }) => {
  if (!reliability) return null;

  if (reliability.status === 'insufficient_history') {
    return (
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs flex items-center gap-3">
        <ShieldCheck className="text-slate-500 flex-shrink-0" size={24} />
        <div>
          <span className="font-bold text-slate-300 block">Platform Trust Indicator</span>
          <span className="text-slate-400 text-[11px]">New Creator • {reliability.sampleSizeText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="text-emerald-400" size={20} />
          <h4 className="font-bold text-white text-sm">Platform Reliability Score</h4>
        </div>
        <div className="text-2xl font-black text-emerald-400 font-mono">
          {reliability.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 italic">{reliability.sampleSizeText}</p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Completed</span>
          <span className="font-bold text-white text-sm">{reliability.completedProjectsCount}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Approval Rate</span>
          <span className="font-bold text-cyan-400 text-sm">{reliability.onTimeMilestoneRate}%</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Disputes</span>
          <span className="font-bold text-slate-300 text-sm">{reliability.disputesCount}</span>
        </div>
      </div>
    </div>
  );
};
