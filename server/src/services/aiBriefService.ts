import { z } from 'zod';
import { env } from '../config/env';

export interface AIBriefGenerationInput {
  conceptIdea: string;
  productDescription?: string;
  objective?: string;
  targetAudience?: string;
  category?: string;
  budgetAmount?: number;
}

export interface AIBriefGenerationOutput {
  suggestedTitle: string;
  summary: string;
  objective: string;
  targetAudience: string;
  proposedStyle: string;
  mood: string;
  colorPalette: string[];
  suggestedDeliverables: Array<{
    description: string;
    mediaType: 'image' | 'video';
    quantity: number;
    aspectRatio: string;
    resolution: string;
    duration: number;
  }>;
  technicalSpecs: string[];
  acceptanceChecklist: string[];
  clarificationQuestions: string[];
  aiMetadata: {
    isAiGenerated: boolean;
    isFallback: boolean;
    provider: string;
    generatedAt: string;
  };
}

export const generateBriefFromConcept = async (
  input: AIBriefGenerationInput
): Promise<AIBriefGenerationOutput> => {
  const concept = input.conceptIdea || 'Generative AI Visual Campaign';
  const category = input.category || 'Tech & Digital';

  // Deterministic Intelligent Fallback Engine
  const titleSlug = concept.split(' ').slice(0, 4).join(' ');
  const suggestedTitle = `${titleSlug.charAt(0).toUpperCase() + titleSlug.slice(1)} — AI Campaign`;

  const summary = `A high-impact generative visual campaign centered on "${concept}". Designed for ${input.targetAudience || 'tech-savvy digital audiences'} across digital channels.`;

  const objective = input.objective || `Accelerate brand engagement and showcase product capabilities through cutting-edge generative AI video and 3D visual storytelling.`;

  const targetAudience = input.targetAudience || 'Gen Z and Millennial digital natives, tech enthusiasts, and creative directors.';

  const proposedStyle = category === 'Cyberpunk Art'
    ? 'High-contrast neon cyberpunk, holographic lighting, volumetric fog, Octane 3D render feel'
    : 'Cinematic hyper-realism, sleek dark mode aesthetics, dynamic camera movement, 8K neural detail';

  const mood = 'Futuristic, High-Energy, Visionary, Premium';

  const colorPalette = ['#00F2FE', '#3B82F6', '#0B0F17', '#94A3B8', '#10B981'];

  const suggestedDeliverables = [
    {
      description: 'Primary Hero Cinematic Campaign Video',
      mediaType: 'video' as const,
      quantity: 1,
      aspectRatio: '16:9',
      resolution: '4K',
      duration: 15,
    },
    {
      description: 'Vertical Mobile Reel / Short Content Cut',
      mediaType: 'video' as const,
      quantity: 2,
      aspectRatio: '9:16',
      resolution: '4K',
      duration: 10,
    },
    {
      description: 'High-Res Key Visual Brand Banner',
      mediaType: 'image' as const,
      quantity: 3,
      aspectRatio: '16:9',
      resolution: '8K',
      duration: 0,
    },
  ];

  const technicalSpecs = [
    'Runway Gen-3 / Sora 4K rendering stability',
    'Master ProRes or MP4 60fps deliverable exports',
    'Clean uncompressed audio stem delivery (if voiceover included)',
  ];

  const acceptanceChecklist = [
    'Strict adherence to visual style guide & color palette',
    'Zero flickering or anatomical distortion in generative frames',
    'Delivered with complete prompt lineage and seed parameter log',
  ];

  const clarificationQuestions = [
    'Are custom brand logos required as vector overlays or native 3D ControlNet inputs?',
    'Should the audio track feature AI voiceover or licensed synth-wave soundtrack?',
  ];

  return {
    suggestedTitle,
    summary,
    objective,
    targetAudience,
    proposedStyle,
    mood,
    colorPalette,
    suggestedDeliverables,
    technicalSpecs,
    acceptanceChecklist,
    clarificationQuestions,
    aiMetadata: {
      isAiGenerated: true,
      isFallback: true, // Clearly identifies deterministic fallback logic
      provider: 'Kampus AI Deterministic Engine',
      generatedAt: new Date().toISOString(),
    },
  };
};
