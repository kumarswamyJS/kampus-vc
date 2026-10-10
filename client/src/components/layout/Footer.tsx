import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, FileText, HelpCircle } from 'lucide-react';
import { Dialog } from '../ui/Dialog';

export const Footer: React.FC = () => {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const openLegalModal = (title: string, body: string) => {
    setModalContent({ title, body });
  };

  return (
    <footer className="bg-dark-950 border-t border-white/5 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-electric-blue flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-dark-950" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                KAMPUS<span className="text-brand-500">.VC</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The premium marketplace connecting world-class AI visual creators, filmmakers, and digital artists with innovative brands and creative agencies through explainable AI matching.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              © {new Date().getFullYear()} Kampus.VC Inc. All rights reserved.
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="hover:text-brand-400 transition-colors">
                  AI Creator Directory
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-brand-400 transition-colors">
                  Solutions for Brands
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-brand-400 transition-colors">
                  How Kampus.VC Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Creative DNA Passport</li>
              <li>Explainable AI Matching</li>
              <li>AI-Assisted Brief Builder</li>
              <li>Verified Lineage Badge</li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Trust & Policy</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() =>
                    openLegalModal(
                      'Terms of Service',
                      'Kampus.VC platform terms are governed by standard creator licensing contracts and clear escrow milestone releases. Legal agreements will be finalized in upcoming product phases.'
                    )
                  }
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openLegalModal(
                      'Privacy Policy',
                      'We respect creator IP and data privacy. Portfolio images and brand campaign assets are protected under strict access controls. Full privacy policy will be deployed upon commercial launch.'
                    )
                  }
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" /> Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openLegalModal(
                      'Help & Support Center',
                      'Have questions about Kampus.VC? Reach out to support@kampus.vc or join our early creator waiting list.'
                    )
                  }
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Platform Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 text-center text-[11px] text-slate-500">
          Kampus.VC — Empowering the next era of AI visual storytelling.
        </div>
      </div>

      {/* Information Dialog Modal */}
      <Dialog
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title}
      >
        <p className="text-sm text-slate-300 leading-relaxed">{modalContent?.body}</p>
      </Dialog>
    </footer>
  );
};
