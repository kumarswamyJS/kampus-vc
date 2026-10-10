import mongoose, { Schema, Document } from 'mongoose';

export interface ICreativePassport extends Document {
  creatorUserId: mongoose.Types.ObjectId;
  creatorProfileId: mongoose.Types.ObjectId;
  identityStatement: string;
  primaryCategories: string[];
  secondaryCategories: string[];
  preferredVisualStyles: string[];
  colorPalettes: string[];
  productionTools: string[];
  aiUsageApproach: string;
  licensingPreferences: string[];
  strengths: string[];
  portfolioGaps: string[];
  completenessScore: number;
  lastAnalyzedAt: Date;
  analysisType: 'metadata_deterministic' | 'ai_model_derived';
  provenanceEvidence: Array<{
    attributeName: string;
    sourceType: 'creator_declared' | 'portfolio_tag' | 'platform_observed';
    evidenceCount: number;
    description: string;
  }>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProvenanceSchema = new Schema({
  attributeName: { type: String, required: true },
  sourceType: {
    type: String,
    enum: ['creator_declared', 'portfolio_tag', 'platform_observed'],
    default: 'portfolio_tag',
  },
  evidenceCount: { type: Number, default: 1 },
  description: { type: String, default: '' },
});

const CreativePassportSchema = new Schema<ICreativePassport>(
  {
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    creatorProfileId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },
    identityStatement: { type: String, default: '', trim: true },
    primaryCategories: [{ type: String }],
    secondaryCategories: [{ type: String }],
    preferredVisualStyles: [{ type: String }],
    colorPalettes: [{ type: String }],
    productionTools: [{ type: String }],
    aiUsageApproach: { type: String, default: 'Assisted AI generation & custom fine-tuning' },
    licensingPreferences: [{ type: String }],
    strengths: [{ type: String }],
    portfolioGaps: [{ type: String }],
    completenessScore: { type: Number, default: 0, min: 0, max: 100 },
    lastAnalyzedAt: { type: Date, default: Date.now },
    analysisType: { type: String, enum: ['metadata_deterministic', 'ai_model_derived'], default: 'metadata_deterministic' },
    provenanceEvidence: [ProvenanceSchema],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CreativePassport = mongoose.model<ICreativePassport>('CreativePassport', CreativePassportSchema);
