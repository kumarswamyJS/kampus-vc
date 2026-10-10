import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { CreatorPreviewSection } from '../components/landing/CreatorPreviewSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { DifferentiationSection } from '../components/landing/DifferentiationSection';
import { ValuePropsSection } from '../components/landing/ValuePropsSection';
import { CTASection } from '../components/landing/CTASection';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <CreatorPreviewSection />
      <HowItWorksSection />
      <DifferentiationSection />
      <ValuePropsSection />
      <CTASection />
    </div>
  );
};
