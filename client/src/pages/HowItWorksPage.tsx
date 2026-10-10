import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { DifferentiationSection } from '../components/landing/DifferentiationSection';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="pb-20">
      <PageHeader
        badge="Platform Guide"
        title="How Kampus.VC Operates"
        description="A transparent look at our explainable AI visual match engine, Creative DNA Passports, and milestone escrow workflow."
      />

      <HowItWorksSection />
      <DifferentiationSection />
    </div>
  );
};
