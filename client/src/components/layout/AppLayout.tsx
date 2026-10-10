import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-950 text-slate-100 font-sans selection:bg-brand-500/20 selection:text-brand-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
