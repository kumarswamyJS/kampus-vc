import { Schema, model, Document, Types } from 'mongoose';

export interface IPortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface ICreator extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  handle: string;
  email: string;
  role: 'creator';
  bio?: string;
  specialties: string[];
  specialtyCategory: string;
  aiTools: string[];
  portfolioUrls: string[];
  portfolioSamples: IPortfolioItem[];
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  portfolioIntro?: string;
  hourlyRate: string;
  availability: 'Full-Time' | 'Part-Time' | 'Contract' | 'Unavailable';
  socialLinks: {
    website?: string;
    twitter?: string;
    instagram?: string;
    artstation?: string;
    github?: string;
  };
  rating: number;
  completedCampaigns: number;
  verified: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const creatorSchema = new Schema<ICreator>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: 'creator' },
    bio: { type: String, default: '' },
    specialties: [{ type: String }],
    specialtyCategory: { type: String, default: 'AI Filmmaking' },
    aiTools: [{ type: String }],
    portfolioUrls: [{ type: String }],
    portfolioSamples: [
      {
        id: { type: String },
        title: { type: String },
        imageUrl: { type: String },
        category: { type: String },
      },
    ],
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Master'],
      default: 'Intermediate',
    },
    portfolioIntro: { type: String, default: '' },
    hourlyRate: { type: String, default: '$100/hr' },
    availability: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Unavailable'],
      default: 'Contract',
    },
    socialLinks: {
      website: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      artstation: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    rating: { type: Number, default: 5.0 },
    completedCampaigns: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Creator = model<ICreator>('Creator', creatorSchema);
