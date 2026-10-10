import mongoose, { Schema, Document } from 'mongoose';

export interface IDisputeEvidence {
  _id: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  mediaUrl?: string;
  createdAt: Date;
}

export interface IDisputeDiscussion {
  _id: mongoose.Types.ObjectId;
  senderUserId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IDisputeSettlement {
  proposedBy: mongoose.Types.ObjectId;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposedAt: Date;
}

export interface IDispute extends Document {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  initiatorUserId: mongoose.Types.ObjectId;
  respondentUserId: mongoose.Types.ObjectId;
  category:
    | 'deliverable_quality'
    | 'missed_deadline'
    | 'scope_disagreement'
    | 'revision_disagreement'
    | 'communication_issue'
    | 'payment_status'
    | 'licensing_disagreement'
    | 'other';
  title: string;
  description: string;
  requestedResolution: string;
  status: 'open' | 'awaiting_response' | 'under_review' | 'awaiting_evidence' | 'escalated_admin' | 'resolved' | 'closed';
  evidence: IDisputeEvidence[];
  discussion: IDisputeDiscussion[];
  settlementProposal?: IDisputeSettlement;
  resolutionSummary?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IDisputeEvidence>({
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mediaUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const DiscussionSchema = new Schema<IDisputeDiscussion>({
  senderUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const DisputeSchema = new Schema<IDispute>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId },
    initiatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    respondentUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: [
        'deliverable_quality',
        'missed_deadline',
        'scope_disagreement',
        'revision_disagreement',
        'communication_issue',
        'payment_status',
        'licensing_disagreement',
        'other',
      ],
      default: 'deliverable_quality',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requestedResolution: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'awaiting_response', 'under_review', 'awaiting_evidence', 'escalated_admin', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    evidence: [EvidenceSchema],
    discussion: [DiscussionSchema],
    settlementProposal: {
      proposedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      terms: { type: String },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      proposedAt: { type: Date },
    },
    resolutionSummary: { type: String },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

DisputeSchema.index({ projectId: 1, status: 1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
