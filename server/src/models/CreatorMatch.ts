import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchComponent {
  dimension: string;
  score: number; // 0 - 100
  weight: number; // percentage e.g., 25
  weightedScore: number;
  reason: string;
  coverage: number; // 0 - 100 confidence
}

export interface ICreatorMatch extends Document {
  briefId: mongoose.Types.ObjectId;
  creatorUserId: mongoose.Types.ObjectId;
  creatorProfileId: mongoose.Types.ObjectId;
  overallScore: number; // 0 - 100
  dataCoverage: number; // 0 - 100
  algorithmVersion: string;
  components: IMatchComponent[];
  positiveEvidence: string[];
  mismatchesAndGaps: string[];
  missingInformation: string[];
  aiMetadata?: {
    isAiEnhanced: boolean;
    explanation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MatchComponentSchema = new Schema<IMatchComponent>(
  {
    dimension: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true },
    weightedScore: { type: Number, required: true },
    reason: { type: String, default: '' },
    coverage: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const CreatorMatchSchema = new Schema<ICreatorMatch>(
  {
    briefId: { type: Schema.Types.ObjectId, ref: 'CampaignBrief', required: true, index: true },
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorProfileId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },
    overallScore: { type: Number, required: true, min: 0, max: 100, index: true },
    dataCoverage: { type: Number, required: true, min: 0, max: 100 },
    algorithmVersion: { type: String, default: 'v1.0-deterministic' },
    components: [MatchComponentSchema],
    positiveEvidence: [{ type: String }],
    mismatchesAndGaps: [{ type: String }],
    missingInformation: [{ type: String }],
    aiMetadata: {
      isAiEnhanced: { type: Boolean, default: false },
      explanation: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch top matches for a brief
CreatorMatchSchema.index({ briefId: 1, overallScore: -1 });
CreatorMatchSchema.index({ briefId: 1, creatorUserId: 1 }, { unique: true });

export const CreatorMatch = mongoose.model<ICreatorMatch>('CreatorMatch', CreatorMatchSchema);
