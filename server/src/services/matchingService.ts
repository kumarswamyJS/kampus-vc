import mongoose from 'mongoose';
import { CampaignBrief } from '../models/CampaignBrief';
import { Creator } from '../models/Creator';
import { PortfolioItem } from '../models/PortfolioItem';
import { CreatorMatch, IMatchComponent } from '../models/CreatorMatch';

export interface IMatchResult {
  briefId: string;
  creatorUserId: string;
  creatorProfileId: string;
  overallScore: number;
  dataCoverage: number;
  algorithmVersion: string;
  components: IMatchComponent[];
  positiveEvidence: string[];
  mismatchesAndGaps: string[];
  missingInformation: string[];
}

export class MatchingService {
  /**
   * Calculate explainable match score between a CampaignBrief and a Creator profile + portfolio
   */
  public async calculateMatch(briefId: string, creatorUserId: string): Promise<IMatchResult> {
    const brief = await CampaignBrief.findById(briefId);
    if (!brief) {
      throw new Error(`CampaignBrief not found: ${briefId}`);
    }

    const creator = await Creator.findOne({ userId: creatorUserId });
    if (!creator) {
      throw new Error(`Creator profile not found for user: ${creatorUserId}`);
    }

    // Fetch public portfolio items for the creator
    const portfolioItems = await PortfolioItem.find({
      userId: creatorUserId,
      visibility: 'public',
    });

    const components: IMatchComponent[] = [];
    const positiveEvidence: string[] = [];
    const mismatchesAndGaps: string[] = [];
    const missingInformation: string[] = [];

    let evaluatedWeightsSum = 0;
    let weightedScoresSum = 0;
    let dataCoverageSum = 0;

    // 1. Category & Niche Compatibility (25%)
    const categoryWeight = 25;
    const briefCategory = (brief.category || '').toLowerCase();
    const creatorSpecialty = (creator.specialtyCategory || '').toLowerCase();
    const creatorSpecialtiesList = (creator.specialties || []).map((s) => s.toLowerCase());

    let categoryScore = 0;
    let categoryCoverage = 100;
    let categoryReason = '';

    if (!briefCategory) {
      categoryCoverage = 50;
      missingInformation.push('Campaign brief category is unspecified.');
    }

    if (briefCategory && (creatorSpecialty.includes(briefCategory) || briefCategory.includes(creatorSpecialty))) {
      categoryScore = 100;
      categoryReason = `Creator specialty "${creator.specialtyCategory}" directly matches campaign category "${brief.category}".`;
      positiveEvidence.push(`Direct specialty match: ${brief.category}`);
    } else if (creatorSpecialtiesList.some((s) => s.includes(briefCategory) || briefCategory.includes(s))) {
      categoryScore = 85;
      categoryReason = `Creator specializes in related area matching "${brief.category}".`;
      positiveEvidence.push(`Secondary specialty match in ${brief.category}`);
    } else {
      categoryScore = 40;
      categoryReason = `Creator focus (${creator.specialtyCategory || 'General'}) differs from brief category (${brief.category}).`;
      mismatchesAndGaps.push(`Category mismatch: Brief requires ${brief.category}, creator focuses on ${creator.specialtyCategory || 'other areas'}.`);
    }

    components.push({
      dimension: 'Category & Niche Compatibility',
      score: categoryScore,
      weight: categoryWeight,
      weightedScore: Math.round((categoryScore * categoryWeight) / 100),
      reason: categoryReason,
      coverage: categoryCoverage,
    });
    evaluatedWeightsSum += categoryWeight;
    weightedScoresSum += (categoryScore * categoryWeight) / 100;
    dataCoverageSum += categoryCoverage * (categoryWeight / 100);

    // 2. Portfolio Tags & Subject Matter Relevance (20%)
    const portfolioWeight = 20;
    let portfolioScore = 50;
    let portfolioCoverage = 100;
    let portfolioReason = '';

    if (portfolioItems.length === 0) {
      portfolioScore = 30;
      portfolioCoverage = 30;
      portfolioReason = 'Creator has no public portfolio items listed.';
      missingInformation.push('Creator has no public portfolio samples to verify subject matter.');
      mismatchesAndGaps.push('No public portfolio samples uploaded yet.');
    } else {
      const briefKeywords = [
        brief.category,
        brief.title,
        brief.summary,
        brief.visualStyle,
        brief.mood,
      ]
        .join(' ')
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);

      let tagMatches = 0;
      portfolioItems.forEach((item) => {
        const itemText = [item.title, item.description, item.category, ...(item.tags || []), ...(item.toolsUsed || [])]
          .join(' ')
          .toLowerCase();

        briefKeywords.forEach((kw) => {
          if (itemText.includes(kw)) tagMatches++;
        });
      });

      if (tagMatches > 5) {
        portfolioScore = 95;
        portfolioReason = `Strong portfolio alignment with ${portfolioItems.length} public artworks matching campaign themes.`;
        positiveEvidence.push(`Extensive portfolio artwork (${portfolioItems.length} items) matching campaign concept keywords.`);
      } else if (tagMatches > 1) {
        portfolioScore = 75;
        portfolioReason = `Moderate portfolio overlap (${tagMatches} matching visual tags across ${portfolioItems.length} artworks).`;
        positiveEvidence.push(`Found ${tagMatches} matching thematic tags in creator portfolio.`);
      } else {
        portfolioScore = 50;
        portfolioReason = `Limited direct tag overlap in creator's ${portfolioItems.length} portfolio items.`;
      }
    }

    components.push({
      dimension: 'Portfolio & Keyword Relevance',
      score: portfolioScore,
      weight: portfolioWeight,
      weightedScore: Math.round((portfolioScore * portfolioWeight) / 100),
      reason: portfolioReason,
      coverage: portfolioCoverage,
    });
    evaluatedWeightsSum += portfolioWeight;
    weightedScoresSum += (portfolioScore * portfolioWeight) / 100;
    dataCoverageSum += portfolioCoverage * (portfolioWeight / 100);

    // 3. Deliverable & Media Format Compatibility (15%)
    const formatWeight = 15;
    let formatScore = 70;
    let formatCoverage = 100;
    let formatReason = '';

    const requiredMediaTypes = (brief.deliverables || []).map((d) => (d.mediaType || '').toLowerCase());
    const creatorMediaTypes = portfolioItems.map((p) => p.mediaType.toLowerCase());

    if (requiredMediaTypes.length > 0 && creatorMediaTypes.length > 0) {
      const matches = requiredMediaTypes.filter((req) => creatorMediaTypes.some((c) => c.includes(req) || req.includes(c)));
      if (matches.length > 0) {
        formatScore = 90;
        formatReason = `Creator has demonstrated experience delivering ${matches.join(', ')} formats.`;
        positiveEvidence.push(`Verified media format production capability: ${matches.join(', ')}`);
      } else {
        formatScore = 60;
        formatReason = `Brief requests ${requiredMediaTypes.join(', ')}, portfolio features alternate media types.`;
      }
    } else {
      formatCoverage = 70;
      formatReason = 'Standard video/image format capability assumed.';
    }

    components.push({
      dimension: 'Deliverable & Media Format Fit',
      score: formatScore,
      weight: formatWeight,
      weightedScore: Math.round((formatScore * formatWeight) / 100),
      reason: formatReason,
      coverage: formatCoverage,
    });
    evaluatedWeightsSum += formatWeight;
    weightedScoresSum += (formatScore * formatWeight) / 100;
    dataCoverageSum += formatCoverage * (formatWeight / 100);

    // 4. Visual Style, Mood & Creative Direction (15%)
    const styleWeight = 15;
    let styleScore = 65;
    let styleCoverage = 100;
    let styleReason = '';

    const briefStyle = (brief.visualStyle || brief.mood || '').toLowerCase();
    const creatorBio = [creator.bio, creator.portfolioIntro, ...(creator.aiTools || [])].join(' ').toLowerCase();

    if (!briefStyle) {
      styleCoverage = 50;
      missingInformation.push('Brief visual style preferences are broad or unspecific.');
    } else if (creatorBio.includes(briefStyle)) {
      styleScore = 95;
      styleReason = `Creator bio and toolset match brief visual style direction "${brief.visualStyle || brief.mood}".`;
      positiveEvidence.push(`Visual style alignment: ${brief.visualStyle || brief.mood}`);
    } else {
      styleScore = 70;
      styleReason = 'Compatible aesthetic palette with adaptable style capabilities.';
    }

    components.push({
      dimension: 'Visual Style & Aesthetic Vibe',
      score: styleScore,
      weight: styleWeight,
      weightedScore: Math.round((styleScore * styleWeight) / 100),
      reason: styleReason,
      coverage: styleCoverage,
    });
    evaluatedWeightsSum += styleWeight;
    weightedScoresSum += (styleScore * styleWeight) / 100;
    dataCoverageSum += styleCoverage * (styleWeight / 100);

    // 5. Budget Compatibility (10%)
    const budgetWeight = 10;
    let budgetScore = 75;
    let budgetCoverage = 100;
    let budgetReason = '';

    const briefAmount = brief.budget?.amount || 0;
    const hourlyRateNum = parseFloat((creator.hourlyRate || '').replace(/[^0-9.]/g, ''));

    if (briefAmount <= 0) {
      budgetCoverage = 50;
      budgetReason = 'Brief budget amount is open / flexible.';
    } else if (hourlyRateNum > 0) {
      const estimatedHours = 20; // assumed avg campaign scope
      const estimatedCost = hourlyRateNum * estimatedHours;

      if (briefAmount >= estimatedCost) {
        budgetScore = 100;
        budgetReason = `Brief budget (${brief.budget.currency || 'INR'} ${briefAmount.toLocaleString()}) fits creator standard rate (${creator.hourlyRate}).`;
        positiveEvidence.push(`Budget fits creator expectations (${creator.hourlyRate}).`);
      } else {
        budgetScore = 60;
        budgetReason = `Brief budget is below standard rate estimates based on ${creator.hourlyRate}.`;
        mismatchesAndGaps.push(`Budget negotiation may be needed (Brief: ${briefAmount}, Creator rate: ${creator.hourlyRate}).`);
      }
    } else {
      budgetCoverage = 60;
      budgetReason = 'Creator hourly rate not set; flexible budget assumed.';
    }

    components.push({
      dimension: 'Budget Compatibility',
      score: budgetScore,
      weight: budgetWeight,
      weightedScore: Math.round((budgetScore * budgetWeight) / 100),
      reason: budgetReason,
      coverage: budgetCoverage,
    });
    evaluatedWeightsSum += budgetWeight;
    weightedScoresSum += (budgetScore * budgetWeight) / 100;
    dataCoverageSum += budgetCoverage * (budgetWeight / 100);

    // 6. Tools, Capabilities & Experience (10%)
    const toolsWeight = 10;
    let toolsScore = 70;
    let toolsCoverage = 100;
    let toolsReason = '';

    const aiTools = creator.aiTools || [];
    if (aiTools.length > 0) {
      toolsScore = 90;
      toolsReason = `Proficient in industry AI tools: ${aiTools.join(', ')}.`;
      positiveEvidence.push(`Verified AI toolset: ${aiTools.join(', ')}`);
    } else {
      toolsScore = 60;
      toolsCoverage = 60;
      toolsReason = 'Creator AI tools list not specified.';
      missingInformation.push('Creator AI tools list is not filled.');
    }

    components.push({
      dimension: 'AI Tools & Technical Capabilities',
      score: toolsScore,
      weight: toolsWeight,
      weightedScore: Math.round((toolsScore * toolsWeight) / 100),
      reason: toolsReason,
      coverage: toolsCoverage,
    });
    evaluatedWeightsSum += toolsWeight;
    weightedScoresSum += (toolsScore * toolsWeight) / 100;
    dataCoverageSum += toolsCoverage * (toolsWeight / 100);

    // 7. Availability / Deadline Compatibility (5%)
    const availWeight = 5;
    let availScore = 80;
    let availCoverage = 100;
    let availReason = '';

    const availability = creator.availability || 'Contract';
    if (availability === 'Unavailable') {
      availScore = 20;
      availReason = 'Creator status is currently set to Unavailable.';
      mismatchesAndGaps.push('Creator profile is currently marked Unavailable.');
    } else {
      availScore = 95;
      availReason = `Creator availability is ${availability}.`;
      positiveEvidence.push(`Active creator availability: ${availability}`);
    }

    components.push({
      dimension: 'Availability & Schedule',
      score: availScore,
      weight: availWeight,
      weightedScore: Math.round((availScore * availWeight) / 100),
      reason: availReason,
      coverage: availCoverage,
    });
    evaluatedWeightsSum += availWeight;
    weightedScoresSum += (availScore * availWeight) / 100;
    dataCoverageSum += availCoverage * (availWeight / 100);

    // Normalize final score between 0 and 100
    const finalOverallScore = Math.min(100, Math.max(0, Math.round(weightedScoresSum)));
    const finalDataCoverage = Math.min(100, Math.max(0, Math.round(dataCoverageSum)));

    // Upsert cached CreatorMatch document
    await CreatorMatch.findOneAndUpdate(
      { briefId: brief._id, creatorUserId },
      {
        briefId: brief._id,
        creatorUserId,
        creatorProfileId: creator._id,
        overallScore: finalOverallScore,
        dataCoverage: finalDataCoverage,
        algorithmVersion: 'v1.0-deterministic',
        components,
        positiveEvidence,
        mismatchesAndGaps,
        missingInformation,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return {
      briefId: brief._id.toString(),
      creatorUserId: creatorUserId.toString(),
      creatorProfileId: creator._id.toString(),
      overallScore: finalOverallScore,
      dataCoverage: finalDataCoverage,
      algorithmVersion: 'v1.0-deterministic',
      components,
      positiveEvidence,
      mismatchesAndGaps,
      missingInformation,
    };
  }

  /**
   * Discover and rank top creators for a brand-owned campaign brief
   */
  public async getMatchesForBrief(briefId: string, limit = 10): Promise<Array<{ creator: any; match: IMatchResult }>> {
    const brief = await CampaignBrief.findById(briefId);
    if (!brief) {
      throw new Error('Brief not found');
    }

    // Find all public creators
    const creators = await Creator.find({ isPublic: { $ne: false } }).limit(50);
    const results: Array<{ creator: any; match: IMatchResult }> = [];

    for (const creator of creators) {
      if (!creator.userId) continue;
      try {
        const match = await this.calculateMatch(briefId, creator.userId.toString());
        results.push({ creator, match });
      } catch (err) {
        // Skip creator if matching calculation fails
      }
    }

    // Sort by explainable match score descending
    results.sort((a, b) => b.match.overallScore - a.match.overallScore);
    return results.slice(0, limit);
  }

  /**
   * List relevant published campaign briefs for a creator profile
   */
  public async getMatchesForCreator(creatorUserId: string, limit = 10): Promise<Array<{ brief: any; match: IMatchResult }>> {
    const publishedBriefs = await CampaignBrief.find({ status: 'published' }).limit(30);
    const results: Array<{ brief: any; match: IMatchResult }> = [];

    for (const brief of publishedBriefs) {
      try {
        const match = await this.calculateMatch(brief._id.toString(), creatorUserId);
        results.push({ brief, match });
      } catch (err) {
        // Skip brief if calculation fails
      }
    }

    results.sort((a, b) => b.match.overallScore - a.match.overallScore);
    return results.slice(0, limit);
  }
}

export const matchingService = new MatchingService();
