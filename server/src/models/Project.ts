import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectMilestone {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
  sequence: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'revision_requested' | 'approved' | 'cancelled';
  submissionNotes?: string;
  submissionMediaUrl?: string;
  submittedAt?: Date;
  reviewNotes?: string;
  revisionCount: number;
  reviewedAt?: Date;
  paymentState: 'unfunded' | 'funded_simulated' | 'funded_verified' | 'released_simulated' | 'released_verified';
}

export interface IProject extends Document {
  briefId: mongoose.Types.ObjectId;
  proposalId: mongoose.Types.ObjectId;
  brandUserId: mongoose.Types.ObjectId;
  brandProfileId: mongoose.Types.ObjectId;
  creatorUserId: mongoose.Types.ObjectId;
  creatorProfileId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  licensingTerms: string;
  revisionLimit: number;
  status: 'awaiting_funding' | 'ready' | 'in_progress' | 'in_review' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed';
  milestones: IProjectMilestone[];
  agreementSnapshot: {
    briefTitle: string;
    proposalTitle: string;
    acceptedAt: Date;
    acceptedBudget: number;
    currency: string;
  };
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMilestoneSchema = new Schema<IProjectMilestone>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date },
  sequence: { type: Number, required: true, default: 1 },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'cancelled'],
    default: 'pending',
  },
  submissionNotes: { type: String },
  submissionMediaUrl: { type: String },
  submittedAt: { type: Date },
  reviewNotes: { type: String },
  revisionCount: { type: Number, default: 0 },
  reviewedAt: { type: Date },
  paymentState: {
    type: String,
    enum: ['unfunded', 'funded_simulated', 'funded_verified', 'released_simulated', 'released_verified'],
    default: 'unfunded',
  },
});

const ProjectSchema = new Schema<IProject>(
  {
    briefId: { type: Schema.Types.ObjectId, ref: 'CampaignBrief', required: true, index: true },
    proposalId: { type: Schema.Types.ObjectId, ref: 'Proposal', required: true, unique: true, index: true },
    brandUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brandProfileId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorProfileId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    licensingTerms: { type: String, default: 'Commercial Usage' },
    revisionLimit: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ['awaiting_funding', 'ready', 'in_progress', 'in_review', 'revision_requested', 'completed', 'cancelled', 'disputed'],
      default: 'ready',
      index: true,
    },
    milestones: [ProjectMilestoneSchema],
    agreementSnapshot: {
      briefTitle: { type: String, required: true },
      proposalTitle: { type: String, required: true },
      acceptedAt: { type: Date, default: Date.now },
      acceptedBudget: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ brandUserId: 1, status: 1 });
ProjectSchema.index({ creatorUserId: 1, status: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
