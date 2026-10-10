import { Schema, model, Document, Types } from 'mongoose';

export type BriefStatus = 'draft' | 'published' | 'closed' | 'archived';
export type BudgetFlexibility = 'Fixed' | 'Negotiable' | 'Range';

export interface IDeliverableItem {
  description: string;
  mediaType: 'image' | 'video';
  quantity: number;
  aspectRatio: string;
  resolution: string;
  duration?: number;
  fileFormats: string[];
  sourceFilesRequired: boolean;
}

export interface IReferenceAsset {
  url: string;
  publicId: string;
  mediaType: 'image' | 'video';
  originalName: string;
  size: number;
  uploadedAt: Date;
}

export interface ICreativeDirection {
  directionName: string;
  concept: string;
  mood: string;
  palette: string[];
  composition: string;
  lighting: string;
  visualTreatment: string;
  mediaFormat: string;
  audienceImpact: string;
  constraints?: string;
}

export interface ICampaignBrief extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  brandId: Types.ObjectId;
  title: string;
  summary: string;
  objective: string;
  description: string;
  targetAudience: string;
  category: string;
  distributionPlatforms: string[];
  brandPersonality: string;
  desiredOutcome: string;
  visualStyle: string;
  mood: string;
  colorPreferences: string[];
  lighting: string;
  subjectInfo: string;
  requiredElements: string[];
  excludedElements: string[];
  inspirationLinks: string[];
  selectedDirection?: ICreativeDirection;
  referenceAssets: IReferenceAsset[];
  deliverables: IDeliverableItem[];
  budget: {
    amount: number;
    currency: string;
    flexibility: BudgetFlexibility;
  };
  deadline?: Date;
  milestones: string[];
  revisionLimit: number;
  acceptanceCriteria: string[];
  licensingPreferences: string;
  exclusivity: boolean;
  attribution: boolean;
  status: BriefStatus;
  publishedAt?: Date;
  closedAt?: Date;
  version: number;
  aiMetadata?: {
    isAiGenerated: boolean;
    isFallback: boolean;
    provider?: string;
    generatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const campaignBriefSchema = new Schema<ICampaignBrief>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    title: { type: String, required: [true, 'Campaign title is required'], trim: true },
    summary: { type: String, default: '' },
    objective: { type: String, default: '' },
    description: { type: String, default: '' },
    targetAudience: { type: String, default: '' },
    category: { type: String, default: 'Tech & Digital', index: true },
    distributionPlatforms: [{ type: String }],
    brandPersonality: { type: String, default: '' },
    desiredOutcome: { type: String, default: '' },
    visualStyle: { type: String, default: '' },
    mood: { type: String, default: '' },
    colorPreferences: [{ type: String }],
    lighting: { type: String, default: '' },
    subjectInfo: { type: String, default: '' },
    requiredElements: [{ type: String }],
    excludedElements: [{ type: String }],
    inspirationLinks: [{ type: String }],
    selectedDirection: {
      directionName: { type: String },
      concept: { type: String },
      mood: { type: String },
      palette: [{ type: String }],
      composition: { type: String },
      lighting: { type: String },
      visualTreatment: { type: String },
      mediaFormat: { type: String },
      audienceImpact: { type: String },
      constraints: { type: String },
    },
    referenceAssets: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
        originalName: { type: String, default: 'reference-image' },
        size: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    deliverables: [
      {
        description: { type: String, default: 'AI Generative Video Shot' },
        mediaType: { type: String, enum: ['image', 'video'], default: 'video' },
        quantity: { type: Number, default: 1 },
        aspectRatio: { type: String, default: '16:9' },
        resolution: { type: String, default: '4K' },
        duration: { type: Number, default: 15 },
        fileFormats: [{ type: String, default: 'MP4' }],
        sourceFilesRequired: { type: Boolean, default: true },
      },
    ],
    budget: {
      amount: { type: Number, default: 15000, min: [0, 'Budget cannot be negative'] },
      currency: { type: String, default: 'INR' },
      flexibility: { type: String, enum: ['Fixed', 'Negotiable', 'Range'], default: 'Negotiable' },
    },
    deadline: { type: Date },
    milestones: [{ type: String }],
    revisionLimit: { type: Number, default: 3, min: 0 },
    acceptanceCriteria: [{ type: String }],
    licensingPreferences: { type: String, default: 'Commercial Buyout' },
    exclusivity: { type: Boolean, default: false },
    attribution: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
    closedAt: { type: Date },
    version: { type: Number, default: 1 },
    aiMetadata: {
      isAiGenerated: { type: Boolean, default: false },
      isFallback: { type: Boolean, default: false },
      provider: { type: String, default: 'deterministic-engine' },
      generatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Indexes for brand ownership, public discovery, and category sorting
campaignBriefSchema.index({ brandId: 1, status: 1 });
campaignBriefSchema.index({ status: 1, publishedAt: -1 });

export const CampaignBrief = model<ICampaignBrief>('CampaignBrief', campaignBriefSchema);
