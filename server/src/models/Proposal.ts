import mongoose, { Schema, Document } from 'mongoose';

export interface IProposalMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
}

export interface IProposalDeliverable {
  description: string;
  mediaType: string;
  quantity: number;
  format?: string;
}

export interface IProposal extends Document {
  briefId: mongoose.Types.ObjectId;
  creatorUserId: mongoose.Types.ObjectId;
  creatorProfileId: mongoose.Types.ObjectId;
  brandUserId: mongoose.Types.ObjectId;
  brandProfileId: mongoose.Types.ObjectId;
  title: string;
  coverMessage: string;
  proposedApproach: string;
  relevantPortfolioItemIds: mongoose.Types.ObjectId[];
  deliverables: IProposalDeliverable[];
  proposedBudget: number;
  currency: string;
  proposedTimeline: string; // e.g. "14 days"
  proposedStartDate?: Date;
  proposedCompletionDate?: Date;
  milestones: IProposalMilestone[];
  revisionTerms: string;
  licensingAcknowledgement: boolean;
  status: 'draft' | 'submitted' | 'revision_requested' | 'resubmitted' | 'accepted' | 'rejected' | 'withdrawn';
  revisionRequestMessage?: string;
  decisionReason?: string;
  submittedAt?: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalMilestoneSchema = new Schema<IProposalMilestone>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
  },
  { _id: false }
);

const ProposalDeliverableSchema = new Schema<IProposalDeliverable>(
  {
    description: { type: String, required: true },
    mediaType: { type: String, default: 'image' },
    quantity: { type: Number, default: 1 },
    format: { type: String },
  },
  { _id: false }
);

const ProposalSchema = new Schema<IProposal>(
  {
    briefId: { type: Schema.Types.ObjectId, ref: 'CampaignBrief', required: true, index: true },
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorProfileId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },
    brandUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brandProfileId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    title: { type: String, required: true, trim: true },
    coverMessage: { type: String, required: true, trim: true },
    proposedApproach: { type: String, default: '' },
    relevantPortfolioItemIds: [{ type: Schema.Types.ObjectId, ref: 'PortfolioItem' }],
    deliverables: [ProposalDeliverableSchema],
    proposedBudget: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    proposedTimeline: { type: String, required: true },
    proposedStartDate: { type: Date },
    proposedCompletionDate: { type: Date },
    milestones: [ProposalMilestoneSchema],
    revisionTerms: { type: String, default: '2 Revisions Included' },
    licensingAcknowledgement: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'revision_requested', 'resubmitted', 'accepted', 'rejected', 'withdrawn'],
      default: 'submitted',
      index: true,
    },
    revisionRequestMessage: { type: String },
    decisionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Concurrency protection: prevent multiple active proposals by same creator on same brief
ProposalSchema.index({ briefId: 1, creatorUserId: 1 });

export const Proposal = mongoose.model<IProposal>('Proposal', ProposalSchema);
