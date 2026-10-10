import mongoose, { Schema, Document } from 'mongoose';

export interface ICreatorPayout extends Document {
  payoutId: string;
  projectId: mongoose.Types.ObjectId;
  milestoneId: mongoose.Types.ObjectId;
  creatorUserId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  providerTransferId?: string;
  status: 'pending' | 'processing' | 'transferred' | 'failed';
  failureReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CreatorPayoutSchema = new Schema<ICreatorPayout>(
  {
    payoutId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId, required: true, index: true },
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    providerTransferId: { type: String, index: true },
    status: { type: String, enum: ['pending', 'processing', 'transferred', 'failed'], default: 'pending', index: true },
    failureReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const CreatorPayout = mongoose.model<ICreatorPayout>('CreatorPayout', CreatorPayoutSchema);
