import { CreativePassport, ICreativePassport } from '../models/CreativePassport';
import { Creator } from '../models/Creator';
import { PortfolioItem } from '../models/PortfolioItem';

export const generatePassportForCreator = async (creatorUserId: string): Promise<any> => {
  const creator = await Creator.findOne({ userId: creatorUserId });
  if (!creator) {
    throw new Error('Creator profile not found');
  }

  const portfolioItems = await PortfolioItem.find({ creatorId: creator._id });

  // Extract categories, styles, tools from portfolio & declared profile
  const categorySet = new Set<string>();
  if (creator.specialtyCategory) categorySet.add(creator.specialtyCategory);

  const toolSet = new Set<string>(creator.aiTools || []);
  const styleSet = new Set<string>();

  portfolioItems.forEach((item) => {
    if (item.category) categorySet.add(item.category);
    if (item.tags) item.tags.forEach((t) => styleSet.add(t));
    if (item.toolsUsed) item.toolsUsed.forEach((t) => toolSet.add(t));
  });

  const categories = Array.from(categorySet);
  const primaryCategories = categories.slice(0, 2);
  const secondaryCategories = categories.slice(2);
  const preferredVisualStyles = Array.from(styleSet).slice(0, 6);
  const productionTools = Array.from(toolSet);

  // Provenance evidence
  const provenanceEvidence = [
    {
      attributeName: 'Specialty Categories',
      sourceType: 'creator_declared' as const,
      evidenceCount: categories.length,
      description: `Backed by creator profile declaration and ${portfolioItems.length} portfolio items.`,
    },
    {
      attributeName: 'Production Capabilities & Tools',
      sourceType: 'portfolio_tag' as const,
      evidenceCount: productionTools.length,
      description: `Inferred from production tool tags (${productionTools.slice(0, 3).join(', ')})`,
    },
    {
      attributeName: 'Visual Style Identifiers',
      sourceType: 'portfolio_tag' as const,
      evidenceCount: preferredVisualStyles.length,
      description: `Derived from ${portfolioItems.length} published visual work tags.`,
    },
  ];

  // Completeness score calculation (0-100)
  let score = 20; // Base score
  if (creator.bio) score += 15;
  if (creator.name) score += 10;
  if (productionTools.length > 0) score += 15;
  if (portfolioItems.length >= 1) score += 20;
  if (portfolioItems.length >= 3) score += 20;
  const completenessScore = Math.min(100, score);

  let passport = await CreativePassport.findOne({ creatorUserId });

  const identityStatement = creator.bio || `${creator.name} is an AI visual director specializing in ${primaryCategories.join(', ') || 'digital art'}.`;

  if (!passport) {
    passport = await CreativePassport.create({
      creatorUserId: creator.userId,
      creatorProfileId: creator._id,
      identityStatement,
      primaryCategories: primaryCategories.length ? primaryCategories : ['AI Visual Art'],
      secondaryCategories,
      preferredVisualStyles: preferredVisualStyles.length ? preferredVisualStyles : ['Cinematic', '3D CGI', 'Photorealistic'],
      colorPalettes: ['Cyan Neon', 'Electric Blue', 'Deep Slate', 'Monochrome'],
      productionTools: productionTools.length ? productionTools : ['Midjourney', 'Runway Gen-3', 'ComfyUI'],
      aiUsageApproach: 'Custom fine-tuned workflow with human art direction',
      licensingPreferences: ['Commercial Rights Granted', 'Portfolio Display Permitted'],
      strengths: ['High-resolution 3D renders', 'Fast delivery', 'Consistent aesthetic keyframes'],
      portfolioGaps: portfolioItems.length < 3 ? ['Add 2+ additional project showcases to complete passport'] : [],
      completenessScore,
      lastAnalyzedAt: new Date(),
      analysisType: 'metadata_deterministic',
      provenanceEvidence,
    });
  } else {
    passport.identityStatement = identityStatement;
    passport.primaryCategories = primaryCategories.length ? primaryCategories : passport.primaryCategories;
    passport.secondaryCategories = secondaryCategories;
    passport.preferredVisualStyles = preferredVisualStyles.length ? preferredVisualStyles : passport.preferredVisualStyles;
    passport.productionTools = productionTools.length ? productionTools : passport.productionTools;
    passport.completenessScore = completenessScore;
    passport.provenanceEvidence = provenanceEvidence;
    passport.lastAnalyzedAt = new Date();
    await passport.save();
  }

  return passport;
};
