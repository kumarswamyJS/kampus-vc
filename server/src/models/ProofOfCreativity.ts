import mongoose, { Schema, Document } from 'mongoose';

export interface IProofOfCreativity extends Document {
  portfolioItemId: mongoose.Types.ObjectId;
  creatorUserId: mongoose.Types.ObjectId;
  contributionDescription: string;
  projectRole: string;
  evidenceType: 'process_screenshots' | 'work_in_progress_media' | 'source_file_reference' | 'creator_attestation';
  evidenceUrls: string[];
  declarationSigned: boolean;
  declarationTimestamp: Date;
  status: 'submitted' | 'under_review' | 'attestation_recorded' | 'evidence_verified' | 'rejected';
  reviewerUserId?: mongoose.Types.ObjectId;
  reviewerNotes?: string;
  reviewedAt?: Date;
  versionNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProofOfCreativitySchema = new Schema<IProofOfCreativity>(
  {
    portfolioItemId: { type: Schema.Types.ObjectId, ref: 'PortfolioItem', required: true, index: true },
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contributionDescription: { type: String, required: true, trim: true },
    projectRole: { type: String, default: 'Lead AI Creator / Director' },
    evidenceType: {
      type: String,
      enum: ['process_screenshots', 'work_in_progress_media', 'source_file_reference', 'creator_attestation'],
      default: 'process_screenshots',
    },
    evidenceUrls: [{ type: String }],
    declarationSigned: { type: Boolean, default: true },
    declarationTimestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'attestation_recorded', 'evidence_verified', 'rejected'],
      default: 'submitted',
      index: true,
    },
    reviewerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewerNotes: { type: String },
    reviewedAt: { type: Date },
    versionNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ProofOfCreativitySchema.index({ portfolioItemId: 1, status: 1 });

export const ProofOfCreativity = mongoose.model<IProofOfCreativity>('ProofOfCreativity', ProofOfCreativitySchema);
