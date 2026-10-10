export interface LicensingAnalysisResult {
  sourceType: 'brief' | 'proposal' | 'project';
  commercialUsage: string;
  duration: string;
  exclusivity: string;
  attribution: string;
  paidAdsUsage: string;
  derivativeWorks: string;
  portfolioDisplayPermitted: boolean;
  identifiedConflicts: string[];
  missingTerms: string[];
  summary: string;
}

export const analyzeLicensingTerms = (data: {
  briefTerms?: any;
  proposalTerms?: any;
  projectTerms?: any;
}): LicensingAnalysisResult => {
  const conflicts: string[] = [];
  const missing: string[] = [];

  const commercialUsage = 'Full Commercial & Worldwide Rights Granted';
  const duration = 'Perpetual / Unlimited';
  const exclusivity = data.proposalTerms?.exclusivity || data.briefTerms?.exclusivity || 'Non-Exclusive License';
  const attribution = 'Credit optional / Preferred in promotional media';
  const paidAdsUsage = 'Permitted for Digital, Social & Broadcast Media';
  const derivativeWorks = 'Brand permitted to edit & adapt deliverables';
  const portfolioDisplayPermitted = true;

  if (data.briefTerms && data.proposalTerms) {
    if (data.briefTerms.exclusivity && data.proposalTerms.exclusivity && data.briefTerms.exclusivity !== data.proposalTerms.exclusivity) {
      conflicts.push(`Brief requested "${data.briefTerms.exclusivity}" but proposal specified "${data.proposalTerms.exclusivity}".`);
    }
  }

  if (!data.proposalTerms?.usageDuration) {
    missing.push('Usage duration not explicitly capped (Defaulting to Perpetual).');
  }

  return {
    sourceType: data.projectTerms ? 'project' : data.proposalTerms ? 'proposal' : 'brief',
    commercialUsage,
    duration,
    exclusivity,
    attribution,
    paidAdsUsage,
    derivativeWorks,
    portfolioDisplayPermitted,
    identifiedConflicts: conflicts,
    missingTerms: missing,
    summary: 'Standard Kampus.VC Digital Creative License. Full commercial rights granted upon final milestone payment release.',
  };
};
