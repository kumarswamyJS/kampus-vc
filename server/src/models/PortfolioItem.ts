import { Schema, model, Document, Types } from 'mongoose';

export type MediaType = 'image' | 'video';
export type VisibilityState = 'public' | 'private' | 'draft';
export type AIInvolvementLevel = 'Full Generative' | 'Hybrid AI-VFX' | 'AI Assisted';
export type LicensingType = 'Commercial Buyout' | 'Personal Non-Commercial' | 'Exclusive Rights';

export interface IPortfolioItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  creatorId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  tags: string[];
  toolsUsed: string[];
  projectRole: string;
  clientContext?: string;
  completionDate?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  duration?: number;
  aiInvolvement: AIInvolvementLevel;
  workflowDescription?: string;
  commercialLicensing: LicensingType;
  visibility: VisibilityState;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioItemSchema = new Schema<IPortfolioItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },
    title: { type: String, required: [true, 'Portfolio title is required'], trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Generative Visuals', index: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl: { type: String, required: [true, 'Media URL is required'] },
    thumbnailUrl: { type: String, default: '' },
    previewUrl: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    toolsUsed: [{ type: String, trim: true }],
    projectRole: { type: String, default: 'AI Creator' },
    clientContext: { type: String, default: '' },
    completionDate: { type: String, default: '' },
    aspectRatio: { type: String, default: '16:9' },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    aiInvolvement: {
      type: String,
      enum: ['Full Generative', 'Hybrid AI-VFX', 'AI Assisted'],
      default: 'Full Generative',
    },
    workflowDescription: { type: String, default: '' },
    commercialLicensing: {
      type: String,
      enum: ['Commercial Buyout', 'Personal Non-Commercial', 'Exclusive Rights'],
      default: 'Commercial Buyout',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'draft'],
      default: 'public',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Compound indexes for fast discovery and sorting
portfolioItemSchema.index({ creatorId: 1, visibility: 1, displayOrder: 1 });
portfolioItemSchema.index({ userId: 1, createdAt: -1 });

export const PortfolioItem = model<IPortfolioItem>('PortfolioItem', portfolioItemSchema);
