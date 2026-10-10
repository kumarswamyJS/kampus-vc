import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Server, CheckCircle2, AlertTriangle, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { apiClient } from '../../services/apiClient';
import { HealthStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

import { NotificationDrawer } from './NotificationDrawer';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    let mounted = true;
    const checkBackend = async () => {
      setCheckingHealth(true);
      const res = await apiClient.getHealth();
      if (mounted) {
        setHealthStatus(res);
        setCheckingHealth(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { label: 'Explore Creators', path: '/explore' },
    { label: 'Explore Brands', path: '/brands' },
    { label: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-dark-950/80 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-electric-blue flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-dark-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-1">
                KAMPUS<span className="text-brand-500">.VC</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
                AI Creator Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-brand-400 ${
                    isActive ? 'text-brand-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-4">
            
            {/* Backend API Health Status Indicator */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-white/10 text-xs"
              title={
                healthStatus
                  ? `API Status: Online | DB: ${healthStatus.database.connected ? 'Connected' : 'Disconnected'}`
                  : 'API Status: Offline'
              }
            >
              <Server className="w-3.5 h-3.5 text-slate-400" />
              {checkingHealth ? (
                <span className="text-slate-400 animate-pulse">API Ping...</span>
              ) : healthStatus ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> API Online
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> API Offline
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationDrawer />
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <Avatar name={user.displayName} size="sm" verified={user.isVerified} />
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate">{user.displayName}</span>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full justify-center" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    My Dashboard ({user.displayName})
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-center" onClick={() => { logout(); setIsOpen(false); }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
