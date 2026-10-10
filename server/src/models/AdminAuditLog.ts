import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminAuditLog extends Document {
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  targetType: 'user' | 'project' | 'proof' | 'dispute' | 'payment' | 'reconciliation';
  targetId?: string;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['user', 'project', 'proof', 'dispute', 'payment', 'reconciliation'],
      required: true,
      index: true,
    },
    targetId: { type: String },
    reason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);
