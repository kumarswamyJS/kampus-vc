import mongoose, { Schema, Document } from 'mongoose';

export interface IReconciliationLog extends Document {
  runId: string;
  inspectedPaymentsCount: number;
  matchedCount: number;
  discrepanciesCount: number;
  summary: string;
  triggeredByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReconciliationLogSchema = new Schema<IReconciliationLog>(
  {
    runId: { type: String, required: true, unique: true, index: true },
    inspectedPaymentsCount: { type: Number, default: 0 },
    matchedCount: { type: Number, default: 0 },
    discrepanciesCount: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    triggeredByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ReconciliationLog = mongoose.model<IReconciliationLog>('ReconciliationLog', ReconciliationLogSchema);
