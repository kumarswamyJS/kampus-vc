import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialLedgerEntry extends Document {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  eventType:
    | 'payment_initiated'
    | 'payment_simulated'
    | 'payment_verified'
    | 'release_requested'
    | 'release_simulated'
    | 'release_verified'
    | 'refund_simulated'
    | 'refund_verified';
  amount: number;
  currency: string;
  idempotencyKey: string;
  providerEventId?: string;
  verificationStatus: 'simulated' | 'verified' | 'pending' | 'failed';
  isSimulation: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialLedgerEntrySchema = new Schema<IFinancialLedgerEntry>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId },
    eventType: {
      type: String,
      enum: [
        'payment_initiated',
        'payment_simulated',
        'payment_verified',
        'release_requested',
        'release_simulated',
        'release_verified',
        'refund_simulated',
        'refund_verified',
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    providerEventId: { type: String },
    verificationStatus: {
      type: String,
      enum: ['simulated', 'verified', 'pending', 'failed'],
      default: 'simulated',
    },
    isSimulation: { type: Boolean, default: true, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

FinancialLedgerEntrySchema.index({ projectId: 1, createdAt: -1 });

export const FinancialLedgerEntry = mongoose.model<IFinancialLedgerEntry>(
  'FinancialLedgerEntry',
  FinancialLedgerEntrySchema
);
