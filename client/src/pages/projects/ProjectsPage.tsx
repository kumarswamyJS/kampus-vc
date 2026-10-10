import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectApi } from '../../services/apiClient';
import { Project } from '../../types';
import { Briefcase, Clock, DollarSign, Layers, ChevronRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getMyProjects();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load active projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" /> Workspace & Collaboration
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Active Projects</h1>
            <p className="text-slate-400 text-sm mt-1">
              Track project progress, milestone submissions, revision reviews, and simulated escrow releases.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Loading your project workspaces...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 px-4 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">No active projects</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Projects are automatically initialized when a brand accepts an official proposal.
            </p>
            <button
              onClick={() => navigate('/briefs')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors inline-flex items-center gap-2"
            >
              Browse Campaign Briefs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const brand = typeof project.brandProfileId === 'object' ? project.brandProfileId : null;
              const creator = typeof project.creatorProfileId === 'object' ? project.creatorProfileId : null;
              const brief = typeof project.briefId === 'object' ? project.briefId : null;

              const completedMilestones = (project.milestones || []).filter((m) => m.status === 'approved').length;
              const totalMilestones = project.milestones?.length || 1;
              const progressPct = Math.round((completedMilestones / totalMilestones) * 100);

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-cyan-300 border border-slate-700">
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Escrow Protected
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                      {brief?.title ? `Brief: ${brief.title}` : project.description}
                    </p>

                    {/* Participant Avatar */}
                    <div className="flex items-center gap-2 mb-4 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {user?.role === 'brand' ? creator?.name?.[0] || 'C' : brand?.companyName?.[0] || 'B'}
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px]">
                          {user?.role === 'brand' ? 'Hired Creator' : 'Brand Partner'}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {user?.role === 'brand' ? creator?.name || 'Creator' : brand?.companyName || 'Brand'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Milestone Progress</span>
                        <span className="font-bold text-cyan-400">{completedMilestones} / {totalMilestones} Approved ({progressPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>

                    {/* Key Specs */}
                    <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-3">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Agreed Value
                      </span>
                      <span className="font-bold text-emerald-400">
                        {project.currency} {project.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Project Workspace</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
