import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Clock, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ComingSoonPage: React.FC = () => {
  const location = useLocation();

  const routeTitles: Record<string, { name: string; phase: string; desc: string }> = {
    '/dashboard': {
      name: 'Unified Command Dashboard',
      phase: 'Phase 2',
      desc: 'Campaign activity overview, real-time analytics, and quick actions.',
    },
    '/creator/dashboard': {
      name: 'Creator Studio Dashboard',
      phase: 'Phase 2',
      desc: 'Manage your portfolio items, proposal submissions, and escrow earnings.',
    },
    '/brand/dashboard': {
      name: 'Brand Campaign Manager',
      phase: 'Phase 2',
      desc: 'Track active campaign briefs, review creator applications, and approve milestones.',
    },
    '/briefs': {
      name: 'AI Campaign Brief Generator',
      phase: 'Phase 3',
      desc: 'Interactive brief builder with AI prompt expansion and automated moodboards.',
    },
    '/messages': {
      name: 'Secure Real-Time Messaging',
      phase: 'Phase 4',
      desc: 'Direct creator-brand chat with file attachments and prompt sharing.',
    },
    '/calls': {
      name: 'WebRTC Video Collaboration Suite',
      phase: 'Phase 4',
      desc: 'Live high-definition video calls with interactive screen sharing for creative directors.',
    },
    '/projects': {
      name: 'Milestone Escrow & Projects',
      phase: 'Phase 5',
      desc: 'Track project milestones, file deliverables, and release Razorpay escrow funds.',
    },
    '/settings': {
      name: 'Account & Security Settings',
      phase: 'Phase 2',
      desc: 'Manage OAuth connections, profile settings, and payment payout details.',
    },
  };

  const currentRouteInfo = routeTitles[location.pathname] || {
    name: 'Module Under Active Development',
    phase: 'Upcoming Phase',
    desc: 'This application section is scheduled for release in the next development phase.',
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-radial-gradient">
      <div className="w-full max-w-xl glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="neon">{currentRouteInfo.phase}</Badge>
            <Badge variant="outline" className="font-mono text-[11px]">
              {location.pathname}
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentRouteInfo.name}
          </h2>

          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {currentRouteInfo.desc}
          </p>
        </div>

        {/* Feature Security Note */}
        <div className="p-4 bg-dark-900/90 rounded-2xl border border-white/5 text-xs text-slate-400 flex items-center gap-3 text-left">
          <Lock className="w-5 h-5 text-brand-400 shrink-0" />
          <span>
            Phase 1 foundation is fully active. Backend authorization and database integrations for this module will be connected in Phase 2.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Landing Page
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="primary" size="sm">
              Explore Creators
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};
