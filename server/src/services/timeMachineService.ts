export interface TimeMachineDirection {
  id: string;
  directionName: string;
  concept: string;
  mood: string;
  palette: string[];
  composition: string;
  lighting: string;
  visualTreatment: string;
  mediaFormat: string;
  audienceImpact: string;
  constraints: string;
}

export const generateCreativeDirections = async (
  conceptIdea: string,
  category: string = 'Tech & Digital'
): Promise<TimeMachineDirection[]> => {
  const baseConcept = conceptIdea || 'Generative Product Showcase';

  return [
    {
      id: 'direction-1',
      directionName: 'Cyberpunk Neon Noir',
      concept: `High-impact dark aesthetic showcasing "${baseConcept}" against futuristic neon metropolis grid, holographic lens flare, and urban night energy.`,
      mood: 'Edgy, High-Energy, Cyberpunk, Visionary',
      palette: ['#00F2FE', '#3B82F6', '#8B5CF6', '#07090E', '#141C2E'],
      composition: 'Low-angle dynamic tracking shot, wide 2.39:1 anamorphic framing',
      lighting: 'Volumetric neon cyan rim lights with deep shadow contrast',
      visualTreatment: 'Octane 3D neural pass with chromatic aberration & motion blur',
      mediaFormat: '4K 60fps Video & 8K Key Banner',
      audienceImpact: 'Captivates Gen Z and gaming audience seeking cutting-edge visual intensity.',
      constraints: 'Requires high rendering compute for fluid volumetric fog.',
    },
    {
      id: 'direction-2',
      directionName: 'Minimalist Tech Luxury',
      concept: `Ultra-clean, high-fashion presentation of "${baseConcept}" with brushed metallic surfaces, architectural geometry, and subtle motion dynamics.`,
      mood: 'Sophisticated, Elegant, Prestigious, Serene',
      palette: ['#FFFFFF', '#CBD5E1', '#64748B', '#0F172A', '#0284C7'],
      composition: 'Symmetrical center-aligned macro closeups with smooth dolly zoom',
      lighting: 'Soft overhead studio box diffusion with subtle specular glints',
      visualTreatment: 'Photorealistic ray-traced glass & titanium material shaders',
      mediaFormat: '4K 30fps Cinema Reel',
      audienceImpact: 'Appeals to luxury buyers, enterprise leaders, and design purists.',
      constraints: 'Requires precise material texture maps and clean geometry.',
    },
    {
      id: 'direction-3',
      directionName: 'Surreal Kinetic Hypercolor',
      concept: `Explosive visual energy transforming "${baseConcept}" through fluid liquid optics, morphing generative particles, and vibrant color surges.`,
      mood: 'Avant-Garde, Dynamic, Playful, Hypnotic',
      palette: ['#F43F5E', '#10B981', '#F59E0B', '#6366F1', '#0B0F17'],
      composition: 'Orbital camera motion around fluid particle simulations',
      lighting: 'Multi-directional spectrum strobe with color-shifting gradients',
      visualTreatment: 'Fluid dynamics particle simulation mixed with neural ControlNet',
      mediaFormat: '4K Vertical Reel (9:16) & Square Feed (1:1)',
      audienceImpact: 'Drives maximum social media engagement, stopping feed scrolls instantly.',
      constraints: 'High particle density requires careful frame rate stabilization.',
    },
  ];
};
