import { Schema, model, Document, Types } from 'mongoose';

export interface IBrand extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyName: string;
  industry: string;
  email: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  targetAudience?: string;
  brandPersonality?: string;
  preferredVisualStyles: string[];
  primaryBrandColors: string[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
  typicalCampaignBudget?: string;
  role: 'brand';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    targetAudience: { type: String, default: '' },
    brandPersonality: { type: String, default: '' },
    preferredVisualStyles: [{ type: String }],
    primaryBrandColors: [{ type: String }],
    socialLinks: {
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    typicalCampaignBudget: { type: String, default: '$5,000 - $25,000' },
    role: { type: String, default: 'brand' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Brand = model<IBrand>('Brand', brandSchema);
